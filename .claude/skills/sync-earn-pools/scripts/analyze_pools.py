#!/usr/bin/env python3
"""
Sync earn pools: compare DefiLlama data with local earn-pools.json.
- Validates existing URLs (checks if they work and are specific, not generic)
- Removes pools that no longer exist in DefiLlama
- Adds new pools with auto-generated or null URLs
- Reports issues that need manual attention
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
GENERIC_URL_PATTERNS = [
    r"^https?://curve\.finance/?$",
    r"^https?://app\.beefy\.(finance|com)/?$",
    r"^https?://yearn\.fi/?$",
    r"^https?://yearn\.fi/vaults/?$",
    r"^https?://www\.convexfinance\.com/?$",
    r"^https?://www\.convexfinance\.com/stake/?$",
    r"^https?://aerodrome\.finance/?$",
    r"^https?://aerodrome\.finance/liquidity.*$",
    r"^https?://app\.morpho\.org/?$",
    r"^https?://app\.uniswap\.org/?$",
    r"^https?://app\.uniswap\.org/explore/?$",
    r"^https?://stakedao\.org/?$",
    r"^https?://www\.stakedao\.org/yield/?$",
    r"^https?://app\.extrafi\.io/farm/?$",
    r"^https?://app\.camelot\.exchange/?$",
    r"^https?://app\.balancer\.fi/?$",
    r"^https?://merkl\.angle\.money/?$",
    r"^https?://concentrator\.aladdin\.club/?$",
    r"^https?://app\.dyson\.money/?$",
    r"^https?://originprotocol\.com/?$",
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


def fetch_defillama_pools():
    """Fetch all pools from DefiLlama API."""
    url = "https://yields.llama.fi/pools"
    with urllib.request.urlopen(url, timeout=30) as response:
        data = json.loads(response.read().decode())
        return data.get("data", [])


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
    """Attempt to generate a specific URL for a pool."""
    proj = pool.get("project", "")
    chain = pool.get("chain", "").lower()
    symbol = pool.get("symbol", "")
    underlying = pool.get("underlyingTokens") or []
    pool_meta = pool.get("poolMeta", "")

    # Aerodrome - can generate from token addresses
    if "aerodrome" in proj and len(underlying) >= 2:
        # Determine pool type: 0=stable, -1=volatile, 1=concentrated
        pool_type = "-1"  # default volatile
        if "stable" in pool_meta.lower() if pool_meta else False:
            pool_type = "0"
        elif any(x in symbol.upper() for x in ["USD", "EUSD", "HYUSD", "RGUSD"]):
            # Stablecoin pairs are usually stable pools
            tokens_are_stables = sum(1 for t in symbol.upper().split("-")
                                     if any(s in t for s in ["USD", "DAI", "FRAX"]))
            if tokens_are_stables >= 2:
                pool_type = "0"
        return f"https://aerodrome.finance/deposit?token0={underlying[0]}&token1={underlying[1]}&type={pool_type}"

    # Curve - need poolMeta for slug
    if proj == "curve-dex" and pool_meta:
        chain_path = "ethereum" if chain == "ethereum" else chain
        # poolMeta sometimes has the pool name/slug
        slug = pool_meta.lower().replace(" ", "-")
        return f"https://curve.finance/#/{chain_path}/pools/{slug}/deposit"

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

    # Try to generate URL
    url = generate_url(dl_pool)

    return {
        "description": description,
        "llamaId": dl_pool["pool"],
        "url": url,
        "underlyingTokens": dl_pool.get("underlyingTokens"),
        "symbol": ""
    }


def analyze_and_fix(defillama_pools, earn_pools, validate_urls=False):
    """
    Analyze pools and return categorized results.
    If validate_urls=True, also checks if existing URLs work.
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
        "valid": [],          # Valid pools
        "url_check_errors": [], # Pools where URL check failed
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
            new_entry = create_pool_entry(dl_pool)
            new_entry["_defillama"] = dl_pool  # Keep reference for reporting
            results["to_add"].append(new_entry)

    # Check existing URLs
    existing_pools = [ep for ep in earn_pools if ep["llamaId"] in defillama_by_id]

    if validate_urls:
        print("🔗 Validating URLs (this may take a moment)...")

        def check_pool_url(ep):
            url = ep.get("url")
            if not url:
                return ep, "null", None
            if is_generic_url(url):
                return ep, "generic", None
            works, msg = check_url_works(url)
            return ep, "ok" if works else "broken", msg

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(check_pool_url, ep): ep for ep in existing_pools}
            for future in as_completed(futures):
                ep, status, msg = future.result()
                dl_pool = defillama_by_id.get(ep["llamaId"], {})
                if status == "generic":
                    results["generic_urls"].append({**ep, "_defillama": dl_pool})
                elif status == "broken":
                    results["broken_urls"].append({**ep, "_defillama": dl_pool, "_error": msg})
                elif status == "null":
                    results["generic_urls"].append({**ep, "_defillama": dl_pool})
                else:
                    results["valid"].append(ep)
    else:
        # Just categorize by URL presence
        for ep in existing_pools:
            url = ep.get("url")
            if not url or is_generic_url(url):
                dl_pool = defillama_by_id.get(ep["llamaId"], {})
                results["generic_urls"].append({**ep, "_defillama": dl_pool})
            else:
                results["valid"].append(ep)

    return results


def print_report(results, verbose=False):
    """Print analysis report."""
    print("\n" + "=" * 70)
    print("EARN POOLS SYNC REPORT")
    print("=" * 70)

    total_issues = (len(results["to_remove"]) + len(results["to_add"]) +
                   len(results["broken_urls"]) + len(results["generic_urls"]))

    print(f"\n📊 SUMMARY")
    print(f"   ✅ Valid pools: {len(results['valid'])}")
    print(f"   🗑️  To remove (stale): {len(results['to_remove'])}")
    print(f"   🆕 To add (new): {len(results['to_add'])}")
    print(f"   ❌ Broken URLs: {len(results['broken_urls'])}")
    print(f"   ⚠️  Generic URLs: {len(results['generic_urls'])}")

    # Pools to remove
    if results["to_remove"]:
        print(f"\n🗑️  POOLS TO REMOVE ({len(results['to_remove'])})")
        print("-" * 70)
        for pool in results["to_remove"][:20]:  # Show first 20
            print(f"   - {pool.get('description', 'N/A')}")
        if len(results["to_remove"]) > 20:
            print(f"   ... and {len(results['to_remove']) - 20} more")

    # New pools to add
    if results["to_add"]:
        print(f"\n🆕 NEW POOLS TO ADD ({len(results['to_add'])})")
        print("-" * 70)
        # Sort by TVL
        sorted_pools = sorted(results["to_add"],
                             key=lambda x: x.get("_defillama", {}).get("tvlUsd", 0),
                             reverse=True)
        for pool in sorted_pools[:15]:  # Show top 15 by TVL
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
            # Remove the _defillama reference before saving
            clean_pool = {k: v for k, v in pool.items() if not k.startswith("_")}
            earn_pools.append(clean_pool)
        changes_made.append(f"Added {len(results['to_add'])} new pools")

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
                       help="Automatically remove stale and add new pools")
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

    print("🔍 Analyzing pools...")
    results = analyze_and_fix(defillama_pools, earn_pools, validate_urls=args.validate_urls)

    issues = print_report(results)

    # Apply fixes if requested
    if args.fix and not args.dry_run:
        if results["to_remove"] or results["to_add"]:
            apply_fixes(earn_pools_path, earn_pools, results)
        else:
            print("\n✅ No automatic fixes needed")
    elif args.fix and args.dry_run:
        print("\n🔍 DRY RUN - No changes made")
        if results["to_remove"]:
            print(f"   Would remove {len(results['to_remove'])} stale pools")
        if results["to_add"]:
            print(f"   Would add {len(results['to_add'])} new pools")

    # Return counts for manual URL fixes needed
    manual_fixes = len(results["broken_urls"]) + len(results["generic_urls"])
    new_without_url = len([p for p in results["to_add"] if not p.get("url")])

    if manual_fixes > 0 or new_without_url > 0:
        print(f"\n⚠️  MANUAL ACTION NEEDED:")
        if manual_fixes > 0:
            print(f"   - {manual_fixes} pools need URL fixes")
        if new_without_url > 0:
            print(f"   - {new_without_url} new pools need URLs")

    return 1 if issues > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
