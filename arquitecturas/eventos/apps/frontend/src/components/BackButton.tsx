import { Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
   to?: string;
   label?: string;
   variant?: 'text' | 'outlined' | 'contained';
   color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
   sx?: object;
}

export const BackButton = ({
   to,
   label = 'Volver',
   variant = 'outlined',
   color = 'primary',
   sx = {},
}: BackButtonProps) => {
   const navigate = useNavigate();

   const handleClick = () => {
      if (to) {
         navigate(to);
      } else {
         navigate(-1);
      }
   };

   return (
      <Button
         variant={variant}
         color={color}
         startIcon={<ArrowBackIcon />}
         onClick={handleClick}
         sx={sx}
      >
         {label}
      </Button>
   );
};

export default BackButton;
