import axios from "axios";
import fs from "fs";
import { config } from "dotenv";
import { isAxiosError } from "axios";
config();

// const testURL = "https://warpcast.com/yes2crypto.eth/0x84b3953d"
const excludeThreadOwner = !!process.env.EXCLUDE_THREAD_OWNER;

const url = process.argv[2];
if (!url) {
  throw new Error(
    "Pass the cast url as an argument. e.g node getReplies.js your_cast_url"
  );
}

try {
  new URL(url);
} catch (error) {
  throw new Error(`${url} is not a valid url`);
}

const outputFile = process.argv[3] ?? process.env.DEFAULT_WINNERS_FILE;

if (!outputFile) {
  throw new Error('File missing. Add DEFAULT_WINNERS_FILE to env or pass file as an argument')
}

const { data: data, error } = await axios.get(
  "https://api.neynar.com/v2/farcaster/cast",
  {
    params: {
      type: "url",
      identifier: url,
    },
    headers: {
      api_key: "NEYNAR_API_DOCS",
    },
  }
);

if (error && isAxiosError(error)) {
  if (isAxiosError(error)) {
    throw new Error(error.message);
  } else throw new Error("Something went wrong fetching cast");
}
const threadHash = data.cast.thread_hash;
if (!threadHash) {
  throw new Error("Cast Thread Not Found");
}

const { data: data2, error: error2 } = await axios.get(
  `https://api.neynar.com/v1/farcaster/all-casts-in-thread`,
  {
    params: {
      threadHash: threadHash,
      viewerFid: 22103,
    },
    headers: {
      api_key: "NEYNAR_API_DOCS",
    },
  }
);

if (error2) {
  if (isAxiosError(error2)) {
    throw new Error(error2.message);
  } else {
    throw new Error("Something went wrong fetching thread");
  }
}

// fs.writeFileSync('cast.json', JSON.stringify(data2.result.casts))

const repliersAddresses = convertRepliesToAddressArray(
  data2.result.casts,
  excludeThreadOwner
);
fs.writeFileSync(outputFile, repliersAddresses.toString());

function convertRepliesToAddressArray(casts, excludeThreadOwner) {
  const threadOwnerVerificationAddress = casts[0].author.verifications[0];

  const repliers = new Set();

  casts.forEach((cast) => {
    const castAuthorVerificationAddress = cast.author.verifications[0];

    if (
      castAuthorVerificationAddress != threadOwnerVerificationAddress &&
      castAuthorVerificationAddress
    ) {
      repliers.add(castAuthorVerificationAddress);
    }
  });
  const repliersArray = [...repliers];
  //Include the owner of the thread if exclude thread owner if false (default is true)
  if (!excludeThreadOwner) repliersArray.push(threadOwnerVerificationAddress);
  return repliersArray;
}
