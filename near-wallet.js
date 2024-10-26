// near api js
import { connect, KeyPair, keyStores, providers, transactions } from 'near-api-js';
import { actionCreators, encodeSignedDelegate } from "@near-js/transactions";
import { InMemoryKeyStore } from "@near-js/keystores";

import '@near-wallet-selector/modal-ui/styles.css';

// wallet selector options
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";

import { setupModal } from '@near-wallet-selector/modal-ui';
import { createAccount, relayTransaction} from "@near-relay/client";


const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

window.relayNative = async () => {

  const accountId = "hurricane_kahan.near";
  const privateKey = "ed25519:YX3qni2TgzFk8C84XArgy5VaiRvZ1f4FQFdQQqk4NVRVWZRuVWhkybEsh1kTLUL68pbZ98jmpQzeQaHkmtpPwwY";
  const networkId = "mainnet";
  const keyPair = KeyPair.fromString(privateKey)
  const keyStore = new InMemoryKeyStore();

  await keyStore.setKey(networkId, accountId, keyPair);

  const connectionConfig =  {
    networkId: networkId,
    keyStore,
    nodeUrl: `https://rpc.${networkId}.near.org`,
  }

  const near = await connect(connectionConfig);
  const account = await near.account(accountId);

  const action = actionCreators.functionCall(
      "add_any_event",
      {any_event: 'test_relayer' },
      "100000000000000",
  );


  const signedDelegate = await account.signedDelegate({
    actions: [action],
    blockHeightTtl: 120,
    receiverId: 'login.learnclub.near',
  })
  const res = await fetch('https://relay.mintbase.xyz/relay/hurricane_kahan-0.pay-master.near', {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate))),
    headers: new Headers({ "Content-Type": "application/json", "bitte-api-key": "de94d8ca0f83d0221ee6e0e33984733c1bb0f16cd48d342472c373e2792ee164" }),
  });
  console.log(res)

}

window.relay = async () => {

  const accountId = "hurricane_kahan.near";
  const privateKey = "ed25519:YX3qni2TgzFk8C84XArgy5VaiRvZ1f4FQFdQQqk4NVRVWZRuVWhkybEsh1kTLUL68pbZ98jmpQzeQaHkmtpPwwY";
  const networkId = "mainnet";
  const myKeyStore = new keyStores.InMemoryKeyStore()
  const keyPair = KeyPair.fromString(privateKey)
  await myKeyStore.setKey(networkId, accountId, keyPair);

  const connectionConfig =  {
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://wallet.mainnet.near.org',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://explorer.mainnet.near.org',
    keyStore: myKeyStore,
  }

  const near = await connect(connectionConfig);
  const account = await near.account(accountId);

  const functionCallAction = actionCreators.functionCall(
      "add_any_event",
      {any_event: 'test_relayer' },
      "100000000000000",
      "0"
  );
  console.log(account);
  const receipt = await relayTransaction(
      functionCallAction,
      'login.learnclub.near',
      'https://relay.mintbase.xyz/relay/hurricane_kahan-0.pay-master.near',
      'mainnet',
      account
  )
}
// Wallet that simplifies using the wallet selector
export class Wallet {
  walletSelector;
  wallet;
  network;
  createAccessKeyFor;

  constructor({createAccessKeyFor = undefined, network = 'testnet'}) {
    this.createAccessKeyFor = createAccessKeyFor;
    this.network = 'mainnet';
  }

  // To be called when the website loads
  async startUp() {
    this.walletSelector = await setupWalletSelector({
      network: this.network,
      modules: [
        setupBitteWallet({
          networkId: "mainnet",
          walletUrl: "https://wallet.bitte.ai",
          deprecated: false,
        }),
        setupMyNearWallet(),
        setupHereWallet(),
        setupMeteorWallet(),
      ],
    });

    this.isSignedIn = this.walletSelector.isSignedIn();
    this.isLoaded = true;

    if (this.isSignedIn) {
      this.wallet = await this.walletSelector.wallet();
      this.accountId = this.walletSelector.store.getState().accounts[0].accountId;
    }

    return this.isSignedIn;
  }

  // Sign-in method
  signIn() {
    const description = 'Please select a wallet to sign in.';
    const modal = setupModal(this.walletSelector, {contractId: this.createAccessKeyFor, description});
    modal.show();
  }
}