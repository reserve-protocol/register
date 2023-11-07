import { Box, Flex, Link, Text } from 'theme-ui';
import { Trans, t } from '@lingui/macro';
import Help from 'components/help';
import { type Token } from '@reserve-protocol/token-zapper';

export const UnsupportedZap = ({
  missingTokenSupport,
}: {
  missingTokenSupport: Token[];
}) => {
  return (
    <>
      <Flex
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        mt={3}
        mx={3}
      >
        <Text variant="strong">
          <Trans>Zaps not available for token</Trans>
        </Text>
        <Help
          content={t`The zapper does not currently work with this RToken. This is usually because the basket contains collateral that is not yet supported. Additional collateral types are being expanded over time.`} />
      </Flex>
      {missingTokenSupport.length !== 0 && (
        <>
          <Box mx={3} mt={3}>
            <Text>
              <Trans>Unsupported collaterals:</Trans>
            </Text>
          </Box>
          {missingTokenSupport.map((token) => (
            <Box ml={4} key={token.address.address} mr={3}>
              <Text>&#x2022; {token.symbol}</Text>
            </Box>
          ))}
        </>
      )}
      <Text mx={3} mt={2} variant="strong" sx={{ fontSize: 12 }} color="error">
        <Trans>
          The zapper is opensourced and anyone can add new collateral/request
          support here:{' '}
        </Trans>{' '}
        <Link
          target="_blank"
          href={'https://github.com/reserve-protocol/token-zapper/issues'}
        >
          Zapper repository
        </Link>
      </Text>
    </>
  );
};
