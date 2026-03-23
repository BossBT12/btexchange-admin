import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { Provider } from "react-redux";
import { SnackbarProvider } from "./features/snackBar";
import AppRouter from "./router";
import theme from "./utils/theme";
import { store } from "./store/store";
import "./styles/global.scss";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <SnackbarProvider>
            <AppRouter />
          </SnackbarProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
