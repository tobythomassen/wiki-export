import chromium from "@sparticuz/chrome-aws-lambda";
import JSZip from "jszip";
import { NextApiRequest, NextApiResponse } from "next";
import schema from "../../schema";

export default async (request: NextApiRequest, response: NextApiResponse) => {
  const { urls, configuration } = await schema.validate(
    JSON.parse(request.body)
  );

  const zip = new JSZip();
  const browser = await chromium.puppeteer.launch({
    args: [...chromium.args, "--window-size=640,480"],
    defaultViewport: {
      width: 640,
      height: 480,
    },
    executablePath: await chromium.executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();

    for (let i = 0; i < urls.length; i++) {
      await page.goto(urls[i]);
      const title = await page.$eval("#firstHeading", (e) => e.textContent);

      if (!configuration.contents)
        await page.evaluate(() => document.querySelector(".toc")?.remove());

      if (!configuration.images)
        await page.evaluate(() =>
          document
            .querySelectorAll(".thumbinner")
            .forEach((element) => element.remove())
        );

      await page.evaluate(
        (props: any) => {
          for (const [startSelector, endClass] of props) {
            let marker = document.querySelector(startSelector)?.parentElement;
            if (!marker) continue;

            let removing = false;
            for (const element of Array.from(
              marker.parentElement?.children || []
            ) as Array<Element>) {
              if (element.innerHTML === marker.innerHTML) removing = true;
              if (removing) element.remove();
              if (element.classList.contains(endClass)) removing = false;
            }
          }
        },
        [
          ...(!configuration.related ? [["#See_also", "div-col"]] : []),
          ...(!configuration.footnotes ? [["#Footnotes", "reflist"]] : []),
          ...(!configuration.references ? [["#References", "div-col"]] : []),
        ]
      );

      const pdf = await page.pdf({
        scale: configuration.scale,
        landscape: configuration.landscape,
        format: configuration.format as any,
        margin: {
          bottom: configuration.margin,
          left: configuration.margin,
          right: configuration.margin,
          top: configuration.margin,
        },
      });
      zip.file((title || `Article ${i + 1}`) + ".pdf", pdf);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    response.setHeader("Content-Type", "application/zip");
    response.send(zipBuffer);
  } catch (error) {
    browser.close();

    throw error;
  }

  browser.close();
};
