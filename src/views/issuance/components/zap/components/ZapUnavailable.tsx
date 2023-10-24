import { Container } from 'components';
import { ConnectWalletButton } from 'components/button/TransactionButton';
import { Box, Card, Grid, Text } from 'theme-ui';
import { Trans } from '@lingui/macro';
import WrapSidebar from '../../wrapping/WrapSidebar';
import IssuanceInfo from '../../issue/IssuanceInfo';
import About from '../../about';
import { ZapOverview } from './ZapOverview';

export const ZapUnavailable = () => {
  return (
    <>
      <WrapSidebar />
      <Container pb={[1, 4]}>
        <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[1, 5]}>
          <Box>
            <ZapOverview />
            <Card p={4}>
              <Box
                p={4}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="strong" mb={2} style={{ textAlign: 'center' }}>
                  <Trans>First, connect your wallet</Trans>
                </Text>
                <Text
                  as="p"
                  variant="legend"
                  style={{ textAlign: 'center' }}
                  mt={3}
                >
                  <Trans>
                    Please connect your wallet to use the Zap Minter, which
                    allows you to mint using a single asset.
                  </Trans>
                </Text>
                <Box sx={{ textAlign: 'center' }} mt={3}>
                  <ConnectWalletButton />
                </Box>
              </Box>
            </Card>
          </Box>
          <Box>
            <IssuanceInfo mb={[1, 4]} />
            <About />
          </Box>
        </Grid>
      </Container>
    </>
  );
};
