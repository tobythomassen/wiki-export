import { AppProps } from "next/app";
import { defaultTheme, Link, Pane, Text, ThemeProvider } from "evergreen-ui";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider value={defaultTheme}>
      <Pane
        width="100%"
        gap={12}
        paddingX={16}
        marginX="auto"
        maxWidth={720}
        marginTop={32}
        display="flex"
        flexDirection="column"
      >
        <Component {...pageProps} />
        <Text marginX="auto">
          Made by&nbsp;
          <Link href="https://github.com/tobythomassen" target="_blank">
            Toby
          </Link>
        </Text>
      </Pane>
    </ThemeProvider>
  );
};

export default App;
