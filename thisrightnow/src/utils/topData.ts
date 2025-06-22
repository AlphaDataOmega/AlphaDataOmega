export async function fetchTopEarners() {
  return [
    { address: "0xabc...def", trn: 192.3 },
    { address: "0x123...456", trn: 130.0 },
    { address: "0x999...888", trn: 99.7 },
  ];
}

export async function fetchTopPosts() {
  return [
    { hash: "QmPost1", preview: "🔥 Ethereum won't survive unless...", trn: 75.2 },
    { hash: "QmPost2", preview: "📉 The future of AI is...", trn: 58.7 },
    { hash: "QmPost3", preview: "😱 This DAO changed my life", trn: 44.1 },
  ];
}
