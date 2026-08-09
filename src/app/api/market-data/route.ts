import { NextResponse } from 'next/server';
import { createPublicClient, http, formatGwei } from 'viem';
import { arcTestnet } from '@/config/chains';
import { sepolia } from 'viem/chains';

export const revalidate = 900; // Cache the entire route for 15 minutes

export async function GET() {
  try {
    // 1. Fetch Stablecoin Data from CoinGecko
    const cgResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,euro-coin,tether,dai&vs_currencies=usd,eur&include_24hr_change=true&include_market_cap=true',
      { next: { revalidate: 900 } }
    );
    const cgData = await cgResponse.json();

    // 2. Fetch Gas Prices using Viem
    const arcClient = createPublicClient({
      chain: arcTestnet,
      transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL as string),
    });
    
    const sepoliaClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL as string),
    });

    const [arcGasPrice, sepoliaGasPrice] = await Promise.all([
      arcClient.getGasPrice().catch(() => 0n),
      sepoliaClient.getGasPrice().catch(() => 0n),
    ]);

    // 3. Fetch Real News from CoinTelegraph RSS (Free & reliable)
    const realNews = [];
    try {
      const rssResponse = await fetch('https://cointelegraph.com/rss', { next: { revalidate: 900 } });
      const rssText = await rssResponse.text();
      
      const items = rssText.match(/<item>[\s\S]*?<\/item>/g) || [];
      for (let i = 0; i < Math.min(3, items.length); i++) {
        const item = items[i];
        const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
        const descMatch = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
        const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        const creatorMatch = item.match(/<dc:creator>(.*?)<\/dc:creator>/);
        
        let summary = "Read more...";
        if (descMatch && descMatch[1]) {
          summary = descMatch[1].replace(/<[^>]+>/g, '').trim(); // Strip HTML tags
        }

        let timeStr = "Recently";
        if (dateMatch && dateMatch[1]) {
          const date = new Date(dateMatch[1]);
          timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        realNews.push({
          id: i + 1,
          title: titleMatch ? titleMatch[1] : "Crypto News",
          summary: summary.length > 110 ? summary.substring(0, 110) + "..." : summary,
          source: creatorMatch ? creatorMatch[1].replace('Cointelegraph by ', 'Cointelegraph - ') : "Cointelegraph",
          time: timeStr
        });
      }
    } catch (err) {
      console.error('Failed to parse RSS feed', err);
    }

    // Format data
    const data = {
      stablecoins: {
        USDC: cgData['usd-coin'],
        EURC: cgData['euro-coin'],
        USDT: cgData['tether'],
        DAI: cgData['dai'],
      },
      gas: {
        arcTestnet: Number(formatGwei(arcGasPrice)).toFixed(4),
        sepolia: Number(formatGwei(sepoliaGasPrice)).toFixed(2),
      },
      news: realNews
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
