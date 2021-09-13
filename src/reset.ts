import { name, version } from "../package.json";

import { filterValid } from "./validate";
import { request } from "https";
import { unique } from "./util";

const npm = "https://npmjs.com";
const host = "api.github.com";
const defaultAgent = name + "/" + version + " (+" + npm + "/" + name + ")";
const defaultDescription = "Tokens reset with " + defaultAgent;

// https://docs.github.com/en/rest/reference/gists
interface Gist {
  url: string;
  forks_url: string;
  commits_url: string;
  id: string;
  node_id: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  description: string;
  comments: number;
  comments_url: string;
}

export function reset(
  tokens: string[],
  github: string,
  {
    timeout = 10000,
    description = defaultDescription,
    agent = defaultAgent
  } = {
    timeout: 10000,
    description: defaultDescription,
    agent: defaultAgent
  }
) {
  tokens = unique(filterValid(tokens));
  if (!tokens.length) return Promise.reject(Error("No valid tokens provided"));

  const files = { "tokens.txt": tokens.join("\n") };
  const body = {
    files,
    description,
    public: true
  };

  const headers = {
    "user-agent": agent,
    authorization: "token " + github
  };

  return new Promise((resolve, reject) => {
    const req = request(
      {
        host,
        headers,
        path: "/gists",
        method: "POST"
      },
      res => {
        if (res.statusCode !== 200)
          reject(
            Error(
              "URL responded with " + res.statusCode + ": " + res.statusMessage
            )
          );

        let str = "";
        res.on("data", chunk => (str += chunk));
        res.on("end", () => {
          let { id }: Gist = JSON.parse(str);
          if (!timeout || isNaN(timeout) || timeout === Infinity)
            return resolve(tokens.length);

          setTimeout(
            () =>
              request(
                {
                  host,
                  headers,
                  path: "/gists/" + id,
                  method: "DELETE"
                },
                () => resolve(tokens.length)
              ),
            10000
          );
        });
      }
    );

    req.write(JSON.stringify(body));
    req.end();
  });
}