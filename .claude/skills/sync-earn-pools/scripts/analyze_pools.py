#!/usr/bin/env python3
"""
Sync earn pools: compare DefiLlama data with local earn-pools.json.
- Validates existing URLs (checks if they work and are specific, not generic)
- Removes pools that no longer exist in DefiLlama
- Adds new pools with auto-generated or null URLs
- Reports issues that need manual attention
- Can auto-generate URLs for Convex (by querying on-chain pool IDs)
"""

import json
import sys
import urllib.request
import urllib.error
import ssl
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Tokens we care about (Reserve Protocol related)
RELEVANT_TOKENS = {
    # RSR
    "0x320623b8e4ff03373931769a31fc52a4e78b5d70",  # RSR Mainnet
    "0xab36452dbac151be02b16ca17d8919826072f64a",  # RSR Base
    # eUSD
    "0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f",  # eUSD Mainnet
    "0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4",  # eUSD Base
    # hyUSD
    "0xacdf0dba4b9839b96221a8487e9ca660a48212be",  # hyUSD Mainnet
    "0xcc7ff230365bd730ee4b352cc2492cedac49383e",  # hyUSD Base
    # ETH+
    "0xe72b141df173b999ae7c1adcbf60cc9833ce56a8",  # ETH+ Mainnet
    # USDC+
    "0xfc0b1eef20e4c68b3dcf36c4537cfa7ce46ca70b",  # USDC+ Mainnet
    # USD3
    "0x0d86883faf4ffd7aeb116390af37746f45b6f378",  # USD3 Mainnet
    # rgUSD
    "0x78da5799cf427fee11e9996982f4150ece7a99a7",  # rgUSD Mainnet
    "0x8e5e9df4f0ea39ae5270e79bbabfcc34203a3470",  # rgUSD Base
    # bsdETH
    "0xcb327b99ff831bf8223cced12b1338ff3aa322ff",  # bsdETH Base
    # dgnETH
    "0x005f893ecd7bf9667195642f7649da8163e23658",  # dgnETH Mainnet
    # KNOX
    "0x0e09cb4bba8c0a2cc3d0ac8ed16f1769f5495b5d",  # KNOX Arbitrum
}

# Supported chains
SUPPORTED_CHAINS = {"ethereum", "base", "arbitrum"}

# Generic URLs that are NOT specific pool links (need to be replaced)
# Note: Concentrator is excluded since it has no pool-specific URLs
GENERIC_URL_PATTERNS = [
    r"^https?://curve\.finance/?$",
    r"^https?://app\.beefy\.(finance|com)/?$",
    r"^https?://yearn\.fi/?$",
    r"^https?://yearn\.fi/vaults/?$",
    r"^https?://www\.convexfinance\.com/?$",
    r"^https?://www\.convexfinance\.com/stake/?$",
    r"^https?://aerodrome\.finance/?$",
    r"^https?://aerodrome\.finance/liquidity.*$",  # liquidity URLs are generic
    r"^https?://app\.morpho\.org/?$",
    r"^https?://app\.uniswap\.org/?$",
    r"^https?://app\.uniswap\.org/explore/?$",
    r"^https?://stakedao\.org/?$",
    r"^https?://www\.stakedao\.org/yield/?$",
    r"^https?://app\.extrafi\.io/farm/?$",
    r"^https?://app\.camelot\.exchange/?$",
    r"^https?://app\.balancer\.fi/?$",
    r"^https?://merkl\.angle\.money/?$",
    # Concentrator is NOT included - it's acceptable as generic
    r"^https?://app\.dyson\.money/?$",
    r"^https?://originprotocol\.com/?$",
]

# Incorrect URL patterns that need fixing
INCORRECT_URL_PATTERNS = [
    # Uniswap: old info.uniswap.org or missing chain in path
    (r"^https?://info\.uniswap\.org/#/pools/", "Uniswap URL should use app.uniswap.org/explore/pools/{chain}/{address}"),
    (r"^https?://app\.uniswap\.org/explore#/pools/", "Uniswap URL missing chain - should be /explore/pools/{chain}/{address}"),
    # Convex: using contract address instead of pool number
    (r"^https?://curve\.convexfinance\.com/stake/ethereum/0x[a-fA-F0-9]{40}$", "Convex URL should use pool NUMBER not contract address"),
    # Aerodrome: liquidity query instead of deposit
    (r"^https?://aerodrome\.finance/liquidity\?query=", "Aerodrome URL should use /deposit with token addresses, not /liquidity?query="),
]

# Protocol landing pages for manual lookup
PROTOCOL_PAGES = {
    "curve-dex": "https://curve.finance/#/ethereum/pools",
    "beefy": "https://app.beefy.finance/",
    "yearn-finance": "https://yearn.fi/vaults",
    "convex-finance": "https://www.convexfinance.com/stake",
    "aerodrome-v1": "https://aerodrome.finance/liquidity",
    "aerodrome-v2": "https://aerodrome.finance/liquidity",
    "aerodrome-slipstream": "https://aerodrome.finance/liquidity",
    "morpho-blue": "https://app.morpho.org/",
    "morpho-v1": "https://app.morpho.org/",
    "uniswap-v3": "https://app.uniswap.org/explore/pools",
    "stake-dao": "https://stakedao.org/yield",
    "extra-finance": "https://app.extrafi.io/farm",
    "camelot-v3": "https://app.camelot.exchange/pools",
    "balancer-v2": "https://app.balancer.fi/",
    "merkl": "https://merkl.angle.money/",
    "concentrator": "https://concentrator.aladdin.club/",
    "dyson-money": "https://app.dyson.money/all",
}

# ============================================================================
# CONVEX POOL ID LOOKUP
# ============================================================================

# Convex Booster contract on Ethereum mainnet
CONVEX_BOOSTER = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31"

# Public Ethereum RPC endpoints (fallback chain)
ETHEREUM_RPC_ENDPOINTS = [
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth",
    "https://ethereum.publicnode.com",
    "https://1rpc.io/eth",
]

# Cache for Convex pool mappings: lp_token_address -> pool_id
_convex_pool_cache = {}


def eth_call(rpc_url, to, data, timeout=10, retries=3):
    """Make an eth_call to read contract data with retry logic."""
    import time

    payload = {
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [{"to": to, "data": data}, "latest"],
        "id": 1
    }

    for attempt in range(retries):
        req = urllib.request.Request(
            rpc_url,
            data=json.dumps(payload).encode(),
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (compatible; EarnPoolsBot/1.0)",
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                result = json.loads(response.read().decode())
                if "error" in result:
                    return None
                return result.get("result")
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries - 1:
                # Rate limited - wait and retry
                time.sleep(0.5 * (attempt + 1))
                continue
            return None
        except Exception:
            return None

    return None


def get_convex_pool_length(rpc_url):
    """Get the total number of pools in Convex Booster."""
    # poolLength() selector: 0x081e3eda
    result = eth_call(rpc_url, CONVEX_BOOSTER, "0x081e3eda")
    if result:
        return int(result, 16)
    return None


def get_convex_pool_info(rpc_url, pool_id):
    """Get pool info for a given pool ID. Returns lptoken address."""
    # poolInfo(uint256) selector: 0x1526fe27
    # Encode pool_id as uint256 (32 bytes, hex padded)
    data = "0x1526fe27" + hex(pool_id)[2:].zfill(64)
    result = eth_call(rpc_url, CONVEX_BOOSTER, data)
    if result and len(result) >= 66:
        # First 32 bytes after 0x is the lptoken address (padded)
        lptoken = "0x" + result[26:66]
        return lptoken.lower()
    return None


def build_convex_pool_cache():
    """Build a cache mapping LP token addresses to Convex pool IDs."""
    import time
    global _convex_pool_cache

    if _convex_pool_cache:
        return _convex_pool_cache

    # Try each RPC endpoint until one works
    for rpc_url in ETHEREUM_RPC_ENDPOINTS:
        pool_length = get_convex_pool_length(rpc_url)
        if pool_length is None:
            continue

        print(f"   📡 Querying Convex Booster ({pool_length} pools)...")

        # Query all pools to build the mapping with rate limiting
        errors = 0
        for pid in range(pool_length):
            lptoken = get_convex_pool_info(rpc_url, pid)
            if lptoken:
                _convex_pool_cache[lptoken] = pid
            else:
                errors += 1

            # Small delay to avoid rate limiting
            if pid % 50 == 49:
                time.sleep(0.1)

            # Progress indicator
            if pid % 100 == 99:
                print(f"      ... processed {pid + 1}/{pool_length} pools")

        if _convex_pool_cache:
            print(f"   ✅ Cached {len(_convex_pool_cache)} Convex pool mappings ({errors} errors)")
            return _convex_pool_cache

    print("   ⚠️  Could not query Convex Booster contract")
    return {}


def get_convex_pool_id(lp_token_address):
    """Get the Convex pool ID for a given Curve LP token address."""
    if not _convex_pool_cache:
        build_convex_pool_cache()

    return _convex_pool_cache.get(lp_token_address.lower())


def generate_convex_url(lp_token_address):
    """Generate the correct Convex URL for a given LP token."""
    pool_id = get_convex_pool_id(lp_token_address)
    if pool_id is not None:
        return f"https://curve.convexfinance.com/stake/ethereum/{pool_id}"
    return None


# ============================================================================
# MAIN FUNCTIONS
# ============================================================================

def fetch_defillama_pools():
    """Fetch all pools from DefiLlama API."""
    url = "https://yields.llama.fi/pools"
    with urllib.request.urlopen(url, timeout=30) as response:
        data = json.loads(response.read().decode())
        return data.get("data", [])


def fetch_defillama_pool_enriched(pool_id):
    """Fetch enriched data for a specific pool (includes pool_old address)."""
    url = f"https://yields.llama.fi/poolsEnriched?pool={pool_id}"
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode())
            if data.get("data"):
                return data["data"][0]
    except Exception:
        pass
    return None


def load_earn_pools(path):
    """Load local earn-pools.json."""
    with open(path, "r") as f:
        return json.load(f)


def save_earn_pools(path, pools):
    """Save updated earn-pools.json."""
    with open(path, "w") as f:
        json.dump(pools, f, indent=2)
        f.write("\n")


def is_generic_url(url):
    """Check if URL is a generic landing page rather than a specific pool."""
    if not url:
        return True
    for pattern in GENERIC_URL_PATTERNS:
        if re.match(pattern, url, re.IGNORECASE):
            return True
    return False


def check_incorrect_url(url):
    """Check if URL matches known incorrect patterns. Returns (is_incorrect, message, fixable)."""
    if not url:
        return False, None, False
    for pattern, message in INCORRECT_URL_PATTERNS:
        if re.match(pattern, url, re.IGNORECASE):
            # Check if it's a fixable Convex URL
            fixable = "convexfinance.com" in url and "0x" in url
            return True, message, fixable
    return False, None, False


def extract_convex_lp_from_url(url):
    """Extract the LP token address from a Convex URL with contract address."""
    match = re.search(r'/stake/ethereum/(0x[a-fA-F0-9]{40})$', url, re.IGNORECASE)
    if match:
        return match.group(1).lower()
    return None


def check_url_works(url, timeout=10):
    """Check if a URL is accessible (returns 2xx/3xx status)."""
    if not url:
        return False, "No URL"

    try:
        # Create SSL context that doesn't verify (some DeFi sites have cert issues)
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; EarnPoolsBot/1.0)"}
        )
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
            return response.status < 400, f"HTTP {response.status}"
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}"
    except urllib.error.URLError as e:
        return False, f"URL Error: {str(e.reason)[:50]}"
    except Exception as e:
        return False, f"Error: {str(e)[:50]}"


def is_relevant_pool(pool):
    """Check if pool contains any relevant Reserve Protocol tokens."""
    chain = pool.get("chain", "").lower()
    if chain not in SUPPORTED_CHAINS:
        return False

    underlying = pool.get("underlyingTokens") or []
    for token in underlying:
        if token and token.lower() in RELEVANT_TOKENS:
            return True
    return False


def generate_url(pool):
    """
    Attempt to generate a specific URL for a pool.
    Note: Many protocols require manual lookup, so this returns None for most.
    """
    proj = pool.get("project", "")
    chain = pool.get("chain", "").lower()
    pool_meta = pool.get("poolMeta", "")

    # Curve - can generate from pool address if available in poolMeta
    if proj == "curve-dex" and pool_meta:
        chain_path = "ethereum" if chain == "ethereum" else chain
        # If poolMeta looks like an address, use it
        if pool_meta.startswith("0x") and len(pool_meta) == 42:
            return f"https://curve.finance/#/{chain_path}/pools/{pool_meta}/deposit"

    # Convex - try to generate from LP token address
    if proj == "convex-finance" and chain == "ethereum":
        # Get LP token from pool_old or underlyingTokens
        lp_token = pool.get("pool_old")
        if lp_token:
            url = generate_convex_url(lp_token)
            if url:
                return url

    return None


def create_pool_entry(dl_pool):
    """Create a new earn-pools.json entry from DefiLlama pool data."""
    symbol = dl_pool.get("symbol", "")
    project = dl_pool.get("project", "")

    # Clean up symbol (replace -- with /)
    clean_symbol = symbol.replace("--", "/").replace("-", "/")

    # Generate description
    project_name = project.replace("-", " ").title()
    description = f"{project_name} {clean_symbol}"

    # Try to generate URL (most will be None)
    url = generate_url(dl_pool)

    return {
        "description": description,
        "llamaId": dl_pool["pool"],
        "url": url,
        "underlyingTokens": dl_pool.get("underlyingTokens"),
        "symbol": ""
    }


def analyze_and_fix(defillama_pools, earn_pools, validate_urls=False, auto_fix_urls=False):
    """
    Analyze pools and return categorized results.
    If validate_urls=True, also checks if existing URLs work.
    If auto_fix_urls=True, attempts to fix incorrect Convex URLs.
    """
    # Create lookup maps
    earn_by_id = {p["llamaId"]: p for p in earn_pools}
    defillama_by_id = {p["pool"]: p for p in defillama_pools}

    # Find relevant DefiLlama pools
    relevant_defillama = [p for p in defillama_pools if is_relevant_pool(p)]

    results = {
        "to_remove": [],      # Pools to remove (no longer in DefiLlama)
        "to_add": [],         # New pools to add
        "broken_urls": [],    # URLs that don't work
        "generic_urls": [],   # URLs that are generic (not specific pool links)
        "incorrect_urls": [], # URLs that match known incorrect patterns
        "auto_fixed": [],     # URLs that were automatically fixed
        "valid": [],          # Valid pools
    }

    # Find pools to remove (in JSON but not in DefiLlama)
    for ep in earn_pools:
        pool_id = ep["llamaId"]
        if pool_id not in defillama_by_id:
            results["to_remove"].append(ep)

    # Find new pools to add (in DefiLlama but not in JSON)
    for dl_pool in relevant_defillama:
        pool_id = dl_pool["pool"]
        if pool_id not in earn_by_id:
            # Fetch enriched data to get pool_old (LP token address)
            enriched = fetch_defillama_pool_enriched(pool_id)
            if enriched:
                dl_pool["pool_old"] = enriched.get("pool_old")

            new_entry = create_pool_entry(dl_pool)
            new_entry["_defillama"] = dl_pool  # Keep reference for reporting
            results["to_add"].append(new_entry)

    # Check existing URLs
    existing_pools = [ep for ep in earn_pools if ep["llamaId"] in defillama_by_id]

    for ep in existing_pools:
        url = ep.get("url")
        dl_pool = defillama_by_id.get(ep["llamaId"], {})

        if not url:
            results["generic_urls"].append({**ep, "_defillama": dl_pool})
            continue

        # Check for incorrect patterns
        is_incorrect, msg, fixable = check_incorrect_url(url)

        if is_incorrect:
            if fixable and auto_fix_urls:
                # Try to auto-fix Convex URLs
                lp_token = extract_convex_lp_from_url(url)
                if lp_token:
                    new_url = generate_convex_url(lp_token)
                    if new_url:
                        old_url = ep["url"]
                        ep["url"] = new_url
                        results["auto_fixed"].append({
                            **ep,
                            "_old_url": old_url,
                            "_defillama": dl_pool
                        })
                        continue

            results["incorrect_urls"].append({**ep, "_defillama": dl_pool, "_error": msg})
        elif is_generic_url(url):
            results["generic_urls"].append({**ep, "_defillama": dl_pool})
        else:
            # Optionally validate URL works
            if validate_urls:
                works, error_msg = check_url_works(url)
                if not works:
                    results["broken_urls"].append({**ep, "_defillama": dl_pool, "_error": error_msg})
                    continue
            results["valid"].append(ep)

    return results


def print_report(results, verbose=False):
    """Print analysis report."""
    print("\n" + "=" * 70)
    print("EARN POOLS SYNC REPORT")
    print("=" * 70)

    total_issues = (len(results["to_remove"]) + len(results["to_add"]) +
                   len(results["broken_urls"]) + len(results["generic_urls"]) +
                   len(results["incorrect_urls"]))

    print(f"\n📊 SUMMARY")
    print(f"   ✅ Valid pools: {len(results['valid'])}")
    print(f"   🗑️  To remove (stale): {len(results['to_remove'])}")
    print(f"   🆕 To add (new): {len(results['to_add'])}")
    print(f"   ❌ Broken URLs: {len(results['broken_urls'])}")
    print(f"   ⚠️  Generic URLs: {len(results['generic_urls'])}")
    print(f"   🔧 Incorrect URLs: {len(results['incorrect_urls'])}")
    if results["auto_fixed"]:
        print(f"   ✨ Auto-fixed URLs: {len(results['auto_fixed'])}")

    # Pools to remove
    if results["to_remove"]:
        print(f"\n🗑️  POOLS TO REMOVE ({len(results['to_remove'])})")
        print("-" * 70)
        for pool in results["to_remove"][:20]:
            print(f"   - {pool.get('description', 'N/A')}")
        if len(results["to_remove"]) > 20:
            print(f"   ... and {len(results['to_remove']) - 20} more")

    # New pools to add
    if results["to_add"]:
        print(f"\n🆕 NEW POOLS TO ADD ({len(results['to_add'])})")
        print("-" * 70)
        sorted_pools = sorted(results["to_add"],
                             key=lambda x: x.get("_defillama", {}).get("tvlUsd", 0),
                             reverse=True)
        for pool in sorted_pools[:15]:
            dl = pool.get("_defillama", {})
            url_status = "✅ auto-generated" if pool.get("url") else "❓ needs URL"
            print(f"\n   {pool['description']}")
            print(f"      TVL: ${dl.get('tvlUsd', 0):,.0f} | APY: {dl.get('apy', 0):.2f}%")
            print(f"      URL: {url_status}")
            if pool.get("url"):
                print(f"           {pool['url']}")
            else:
                proj = dl.get("project", "")
                if proj in PROTOCOL_PAGES:
                    print(f"           Find at: {PROTOCOL_PAGES[proj]}")
        if len(results["to_add"]) > 15:
            print(f"\n   ... and {len(results['to_add']) - 15} more pools")

    # Auto-fixed URLs
    if results["auto_fixed"]:
        print(f"\n✨ AUTO-FIXED URLs ({len(results['auto_fixed'])})")
        print("-" * 70)
        for pool in results["auto_fixed"]:
            print(f"   - {pool.get('description', 'N/A')}")
            print(f"     Old: {pool.get('_old_url')}")
            print(f"     New: {pool.get('url')}")

    # Incorrect URLs (highest priority fix)
    if results["incorrect_urls"]:
        print(f"\n🔧 INCORRECT URLs ({len(results['incorrect_urls'])})")
        print("-" * 70)
        for pool in results["incorrect_urls"]:
            print(f"   - {pool.get('description', 'N/A')}")
            print(f"     Current: {pool.get('url')}")
            print(f"     Issue: {pool.get('_error', 'Unknown')}")

    # Broken URLs
    if results["broken_urls"]:
        print(f"\n❌ BROKEN URLS ({len(results['broken_urls'])})")
        print("-" * 70)
        for pool in results["broken_urls"]:
            print(f"   - {pool.get('description', 'N/A')}")
            print(f"     URL: {pool.get('url')}")
            print(f"     Error: {pool.get('_error', 'Unknown')}")

    # Generic URLs
    if results["generic_urls"]:
        print(f"\n⚠️  GENERIC URLs (need specific pool links) ({len(results['generic_urls'])})")
        print("-" * 70)
        for pool in results["generic_urls"][:10]:
            dl = pool.get("_defillama", {})
            print(f"   - {pool.get('description', 'N/A')}")
            print(f"     Current: {pool.get('url') or 'null'}")
            proj = dl.get("project", "")
            if proj in PROTOCOL_PAGES:
                print(f"     Find at: {PROTOCOL_PAGES[proj]}")
        if len(results["generic_urls"]) > 10:
            print(f"   ... and {len(results['generic_urls']) - 10} more")

    print("\n" + "=" * 70)
    return total_issues


def apply_fixes(earn_pools_path, earn_pools, results, auto_remove=True, auto_add=True):
    """Apply fixes to earn-pools.json."""
    changes_made = []

    # Create a new list excluding stale pools
    if auto_remove and results["to_remove"]:
        stale_ids = {p["llamaId"] for p in results["to_remove"]}
        original_count = len(earn_pools)
        earn_pools = [p for p in earn_pools if p["llamaId"] not in stale_ids]
        changes_made.append(f"Removed {original_count - len(earn_pools)} stale pools")

    # Add new pools
    if auto_add and results["to_add"]:
        for pool in results["to_add"]:
            clean_pool = {k: v for k, v in pool.items() if not k.startswith("_")}
            earn_pools.append(clean_pool)
        changes_made.append(f"Added {len(results['to_add'])} new pools")

    # Apply auto-fixed URLs
    if results["auto_fixed"]:
        fixed_ids = {p["llamaId"]: p["url"] for p in results["auto_fixed"]}
        for ep in earn_pools:
            if ep["llamaId"] in fixed_ids:
                ep["url"] = fixed_ids[ep["llamaId"]]
        changes_made.append(f"Fixed {len(results['auto_fixed'])} incorrect URLs")

    if changes_made:
        save_earn_pools(earn_pools_path, earn_pools)
        print(f"\n✅ CHANGES APPLIED:")
        for change in changes_made:
            print(f"   - {change}")
        print(f"   Saved to: {earn_pools_path}")

    return earn_pools


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Sync earn pools with DefiLlama")
    parser.add_argument("path", nargs="?", help="Path to earn-pools.json")
    parser.add_argument("--validate-urls", action="store_true",
                       help="Check if existing URLs are working")
    parser.add_argument("--fix", action="store_true",
                       help="Automatically remove stale, add new pools, and fix incorrect URLs")
    parser.add_argument("--dry-run", action="store_true",
                       help="Show what would be done without making changes")
    args = parser.parse_args()

    # Find earn-pools.json
    if args.path:
        earn_pools_path = Path(args.path)
    else:
        script_dir = Path(__file__).parent
        earn_pools_path = script_dir.parent.parent.parent.parent / "src" / "lib" / "meta" / "earn-pools.json"

    if not earn_pools_path.exists():
        print(f"❌ earn-pools.json not found at: {earn_pools_path}")
        sys.exit(1)

    print(f"📂 Loading earn-pools.json from: {earn_pools_path}")
    earn_pools = load_earn_pools(earn_pools_path)
    print(f"   Loaded {len(earn_pools)} pools")

    print("🌐 Fetching pools from DefiLlama...")
    defillama_pools = fetch_defillama_pools()
    print(f"   Found {len(defillama_pools)} total pools")

    # Build Convex pool cache if we're going to fix URLs
    if args.fix:
        print("🔗 Building Convex pool ID cache...")
        build_convex_pool_cache()

    print("🔍 Analyzing pools...")
    results = analyze_and_fix(
        defillama_pools,
        earn_pools,
        validate_urls=args.validate_urls,
        auto_fix_urls=args.fix
    )

    issues = print_report(results)

    # Apply fixes if requested
    if args.fix and not args.dry_run:
        if results["to_remove"] or results["to_add"] or results["auto_fixed"]:
            apply_fixes(earn_pools_path, earn_pools, results)
        else:
            print("\n✅ No automatic fixes needed")
    elif args.fix and args.dry_run:
        print("\n🔍 DRY RUN - No changes made")
        if results["to_remove"]:
            print(f"   Would remove {len(results['to_remove'])} stale pools")
        if results["to_add"]:
            print(f"   Would add {len(results['to_add'])} new pools")
        if results["auto_fixed"]:
            print(f"   Would fix {len(results['auto_fixed'])} incorrect URLs")

    # Report manual fixes needed
    manual_fixes = len(results["broken_urls"]) + len(results["generic_urls"]) + len(results["incorrect_urls"])
    new_without_url = len([p for p in results["to_add"] if not p.get("url")])

    if manual_fixes > 0 or new_without_url > 0:
        print(f"\n⚠️  MANUAL ACTION NEEDED:")
        if results["incorrect_urls"]:
            print(f"   - {len(results['incorrect_urls'])} pools have incorrect URL patterns")
        if results["broken_urls"]:
            print(f"   - {len(results['broken_urls'])} pools have broken URLs")
        if results["generic_urls"]:
            print(f"   - {len(results['generic_urls'])} pools have generic URLs")
        if new_without_url > 0:
            print(f"   - {new_without_url} new pools need URLs")

    return 1 if issues > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
