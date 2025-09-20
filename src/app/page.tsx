// import { WalletContextProvider } from './hooks/WalletContext';
// import { NFTByOwnerContextProvider } from './hooks/useNFT';
// import { WalletContextProvider } from './hooks/useWallet';
import { NFTByOwnerContextProvider } from './hooks/useNFT';
import { WalletContextProvider } from './hooks/useWallet';
import { MyNFTGallery } from './MyNFTGallery';
// import { NFTsByOwnerContextProvider } from ;
  // import { MyNFTGallery } from './MyNFTGallery';
  
// import { MyNFTGallery } from './components/MyNFTGallery';
// It is highly recommended to use a custom RPC endpoint
const SOLANA_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

function App() {
  return (
    <WalletContextProvider >
      <NFTByOwnerContextProvider rpcEndpoint={"https://api.devnet.solana.com"}>
        {/* Your other components go here */}
        <MyNFTGallery />
      </NFTByOwnerContextProvider>
      </WalletContextProvider>
  );
}

export default App;