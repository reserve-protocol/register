import { Button } from 'components';
import { Box, ButtonProps } from 'theme-ui';

interface ToggleButtonProps extends ButtonProps {
  selected: boolean;
}
export const ToggleButton = ({ selected, children, ...props }: ToggleButtonProps) => {
  return (
    <Button
      small
      sx={{
        border: '2px solid',
        backgroundColor: 'transparent',
        color: selected ? 'primary' : 'lightText',
      }}
      {...props}
    >
      <Box variant="layout.verticalAlign">
        {selected && (
          <Box
            sx={{ height: '6px', width: '6px', backgroundColor: 'primary' }}
            mr={2} />
        )}
        {children}
      </Box>
    </Button>
  );
};
