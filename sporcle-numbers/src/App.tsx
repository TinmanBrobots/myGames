import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import { GameBoard } from './components/GameBoard';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GameBoard />
    </ThemeProvider>
  );
}
