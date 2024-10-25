import { map } from 'rxjs';

import '@near-wallet-selector/modal-ui-js/styles.css';

const signInClass = '.login-with-near-link';
const signOutClass = '.logout-with-near-link';

import { Wallet } from './near-wallet';

const wallet = new Wallet({
        createAccessKeyFor: 'login.learnclub.near',
        network: 'mainnet'
    }
);
const init = async () => {
    await wallet.startUp();

    window.mainWallet = wallet;

    window.state = wallet.walletSelector.store.getState();


    const subscription = window.mainWallet.walletSelector.store.observable
        .pipe(
            map((state) => state.accounts),
        )
        .subscribe((nextAccounts) => {
            if (nextAccounts.length > 0 && !window?.near_login?.user) {
                const [account] = nextAccounts;

                const currentUrl = window.location.href;
                const url = new URL(currentUrl);
                const params = new URLSearchParams(url.search);
                const origin = window.location.origin;
                const pathname = window.location.pathname;
                const newUrl = origin + pathname;
            }
        });


    document.addEventListener("DOMContentLoaded", async () => {
        try {
            document.querySelector(signInClass).addEventListener("click", async (event) => {
                event.preventDefault();
                await window.mainWallet.signIn();
            });
        } catch (error) {
            console.error(error);
        }
    });

}

init().catch((e) => {
    console.log(e)
})
