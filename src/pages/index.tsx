import {
  AddIcon,
  AddToArtifactIcon,
  Button,
  Card,
  Dialog,
  Heading,
  Link,
  Pane,
  RemoveIcon,
  SelectField,
  SettingsIcon,
  Textarea,
  TextInputField,
  toaster,
} from "evergreen-ui";
import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { TypeOf } from "yup";
import CustomSwitch from "../components/CustomSwitch";
import schema from "../schema";

const Page: NextPage = () => {
  const [settings, setSettings] = useState<TypeOf<typeof schema>>(
    schema.getDefault()
  );
  const [multiUrl, setMultiUrl] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isMultiOpen, setMultiOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const onClick = async () => {
    if (settings.urls.length > 15)
      return toaster.warning("Warning", {
        description:
          "There is a maximum of 15 pages per export, please remove some to continue.",
      });

    setLoading(true);

    try {
      const result = await fetch("/api/export", {
        method: "POST",
        body: JSON.stringify(settings),
      });

      if (result.status !== 200) throw new Error();

      const blob = await result.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "export.zip";
      link.click();
      link.remove();

      toaster.success("Success", {
        description:
          "Export successful, your articles will be downloaded momentarily.",
      });
    } catch (error) {
      toaster.danger("Error", {
        description:
          "Could not export one or more articles, please make sure you have supplied valid mediawiki urls.",
      });
    }

    setLoading(false);
  };

  const updateConfiguration = <
    T extends keyof typeof settings["configuration"]
  >(
    field: T,
    value: typeof settings["configuration"][T]
  ) =>
    setSettings((previous) => ({
      ...previous,
      configuration: {
        ...previous.configuration,
        [field]: value,
      },
    }));

  return (
    <>
      <Head>
        <title>Wiki Export</title>
        <meta
          name="description"
          content="A free and easy to use Wikipedia (mediawiki) exporter."
        ></meta>
      </Head>
      <Pane display="flex" justifyContent="space-between" alignItems="center">
        <Heading size={800} marginY={8}>
          Wiki Export
        </Heading>
        <Button
          size="small"
          iconBefore={SettingsIcon}
          disabled={isLoading}
          onClick={() => setSettingsOpen(true)}
        >
          Settings
        </Button>
      </Pane>
      <form
        onSubmit={(e: any) => {
          e.preventDefault();
          const value = e.target.url.value;

          if (!value) return;
          setSettings((previous) => ({
            ...previous,
            urls: [...previous.urls, value],
          }));

          e.target.reset();
        }}
      >
        <Pane gap={4} display="flex" flexWrap="wrap" alignItems="end">
          <TextInputField
            id="url"
            type="url"
            label="Mediawiki URL"
            placeholder="https://wikipedia.org/wiki/JavaScript"
            flexGrow={9999}
            marginBottom={0}
            disabled={isLoading}
          />
          <Pane flexGrow={1} display="flex" gap={4}>
            <Button
              flex={1}
              type="submit"
              appearance="primary"
              disabled={isLoading}
              iconAfter={AddIcon}
            >
              Add
            </Button>
            <Button
              flex={1}
              type="button"
              disabled={isLoading}
              iconAfter={AddToArtifactIcon}
              onClick={() => setMultiOpen(true)}
            >
              Bulk
            </Button>
          </Pane>
        </Pane>
      </form>
      <Pane display="flex" flexDirection="column" gap={8}>
        {!settings.urls.length && (
          <Heading marginX="auto" fontWeight="normal">
            Add some links to get started!
          </Heading>
        )}
        {settings.urls.map((url, i) => (
          <Card
            display="flex"
            justifyContent="space-between"
            background="tint2"
            elevation={0}
            paddingY={4}
            paddingX={8}
            key={i}
          >
            <Link href={url} target="_blank">
              {url}
            </Link>
            <Button
              size="small"
              disabled={isLoading}
              iconAfter={RemoveIcon}
              onClick={() =>
                setSettings((previous) => {
                  const newUrls = Array.from(previous.urls || []);
                  newUrls.splice(i, 1);
                  return { ...settings, urls: newUrls };
                })
              }
            >
              Remove
            </Button>
          </Card>
        ))}
      </Pane>
      <Button
        appearance="primary"
        disabled={!settings.urls?.length}
        isLoading={isLoading}
        onClick={onClick}
        flexGrow={1}
      >
        Export
      </Button>
      <Dialog
        isShown={isMultiOpen}
        title="Import URLs"
        onCloseComplete={() => {
          setMultiOpen(false);
          setMultiUrl("");
        }}
        onConfirm={() => {
          setSettings((previous) => ({
            ...previous,
            urls: [
              ...previous.urls,
              ...multiUrl
                .trim()
                .split("\n")
                .filter((link) => link),
            ],
          }));
          setMultiOpen(false);
          setMultiUrl("");
        }}
        confirmLabel="Add"
        preventBodyScrolling
      >
        <Textarea
          value={multiUrl}
          onChange={(e: any) => setMultiUrl(e.target.value)}
          placeholder="https://wikipedia.org/wiki/JavaScript"
        />
      </Dialog>
      <Dialog
        title="Export Settings"
        onCloseComplete={() => setSettingsOpen(false)}
        isShown={isSettingsOpen}
        hasFooter={false}
        preventBodyScrolling
      >
        <Pane display="flex" flexDirection="column" gap={12}>
          <Pane display="flex" justifyContent="space-between">
            <CustomSwitch
              name="Landscape"
              value={settings.configuration.landscape}
              onChange={(value) => updateConfiguration("landscape", value)}
            />
            <CustomSwitch
              name="Table of Contents"
              value={settings.configuration.contents}
              onChange={(value) => updateConfiguration("contents", value)}
            />

            <CustomSwitch
              name="Images"
              value={settings.configuration.images}
              onChange={(value) => updateConfiguration("images", value)}
            />
          </Pane>

          <Pane display="flex" justifyContent="space-between">
            <CustomSwitch
              name="Related"
              value={settings.configuration.related}
              onChange={(value) => updateConfiguration("related", value)}
            />
            <CustomSwitch
              name="Footnotes"
              value={settings.configuration.footnotes}
              onChange={(value) => updateConfiguration("footnotes", value)}
            />
            <CustomSwitch
              name="References"
              value={settings.configuration.references}
              onChange={(value) => updateConfiguration("references", value)}
            />
          </Pane>

          <SelectField
            label="Format"
            margin={0}
            value={settings.configuration.format}
            onChange={(e) =>
              updateConfiguration("format", e.target.value as any)
            }
          >
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
            <option value="tabloid">Tabloid</option>
            <option value="ledger">Ledger</option>
            <option value="a0">A0</option>
            <option value="a1">A1</option>
            <option value="a2">A2</option>
            <option value="a3">A3</option>
            <option value="a4">A4</option>
            <option value="a5">A5</option>
            <option value="a6">A6</option>
          </SelectField>
          <TextInputField
            margin={0}
            label="Scale"
            type="number"
            min={0.1}
            max={2}
            step={0.05}
            value={settings.configuration.scale}
            onBlur={(e: any) =>
              e.target.value < 0.1 || e.target.value > 2
                ? setTimeout(() => updateConfiguration("scale", 1), 15)
                : undefined
            }
            onChange={(e: any) => {
              updateConfiguration("scale", e.target.value as number);
            }}
          />
          <TextInputField
            label="Margin"
            value={settings.configuration.margin}
            onChange={(e: any) =>
              updateConfiguration("margin", e.target.value as string)
            }
          />
        </Pane>
      </Dialog>
    </>
  );
};

export default Page;
