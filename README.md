# Requirements
Node - Refer to /.nvmrc

Yarn - 1.22.17

# Installation

## To run MapComponent in development mode:

Open a new terminal and run

```
  npm install
  npm start
```

## To run `./example` in development mode:

1. Open a second terminal and run

```
cd /example
yarn install (has to be yarn)
cp .env.example .env.local
```

2. Ask your Team Lead for the .env.local values
3. Run

```
yarn start
```

## Run SSL Proxy

Open a third terminal and run proxy as per https://connectib.atlassian.net/wiki/spaces/CV4/pages/1011417198/Using+OAuth+Identity+Server+when+Developing+Locally

Access site via https://ssdev.platform.localhost:29000/

# Investigation

https://connectib.atlassian.net/wiki/spaces/WorkplaceWebUiTeam/pages/3574169601/Investigations
