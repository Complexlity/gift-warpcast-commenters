# Tip Commenters on a specified cast
This contains two scripts that enables tipping people that comment on a warpcast cast

## Pre-requisites
- [node/npm](https://nodejs.org/en) installed on your machine. The version used for testing is 18.7.1 but should work with newer nodejs version as well
- Private key of a wallet containing some ETH  on base chain (for gas fees) and [DEGEN](https://www.coingecko.com/en/coins/degen) tokens


## Getting Started
- Clone this repo locally
```
git clone https://github.com/Complexlity/tip-warpcast-commenters.git
```

- Enter the directory
```
cd tip-warpcast-commenters
```

- Install dependencies
```
npm install
or
pnpm install
```

- Add Environmental Variables
```
#.env
# Your address private key
PRIVATE_KEY=
# The default name for the output file
DEFAULT_WINNERS_FILE=winners.csv
# Remove this if you want to also gift the thread owner
EXCLUDE_THREAD_OWNER=true
```

Go into the `.env` file and input you wallet private key.
The other two variables are optional

## How to Use
1. Get Replies For A warpcast Url
```
node getReplies <url> <output_file>
```

`output_file` is optional and defaults to the `DEFAULT_WINNERS_FILE` in the .env

e.g `node getReplies https://warpcast.com/complexlity/0x2213bfa1 commenters.csv`

2. Gift DEGENS to the commenters
Currently, only degen is supported
```
node giftTokens <amount> <input_file>
```

`input_file` is optional and defaults to the `DEFAULT_WINNERS_FILE` in the .env

e.g `node giftTokens 100 commenters.csv`

