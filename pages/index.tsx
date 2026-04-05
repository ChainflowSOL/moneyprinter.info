import React from "react";
import List from "components/List";
import CHAIN_DATA from "../components/constants";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    let r = await res.json();
    return r.coefficients?.map((chain: any, indx: number) => {
      return {
        id: indx + 1,
        results: {
          metadata: CHAIN_DATA?.get(chain.chain_token)?.metadata,
          name: CHAIN_DATA?.get(chain.chain_token)?.name,
          icon: CHAIN_DATA?.get(chain.chain_token)?.icon,
          currVal: chain.naka_co_curr_val,
          prevVal: chain.naka_co_prev_val,
        },
      };
    });
  });

export const Home: () => JSX.Element = () => {
  let url = "https://nakaflow.io/api/naka-coeffs";
  const { data, error } = useSWR(url, fetcher);

  if (error) {
    console.log("error is", error);
    return (
      <div>
        <h1 className="title">An error has occurred</h1>
        <p className="contentTitle">
          Ping me on <a href="https://twitter.com/KavyamSingh">twitter</a>. I will
          try to look into it.
        </p>
      </div>
    );
  }

  if (!data)
    return (
      <div>
        <h1 className="description">Loading...</h1>
        <h2>Seems like server didn't send any data 🤔</h2>
        <p className="contentTitle">
          Ping me on <a href="https://twitter.com/KavyamSingh">twitter</a>. I will
          try to look into it.
        </p>
      </div>
    );
  
  const sortedChains = [...data].sort((a, b) => {
    return a.results.name.localeCompare(b.results.name);
  });

  return (
    <main>
      {/* <SocialTags /> */}
      <h1 className="title">Nakamoto Coefficients</h1>
      <p className="description">Live decentralization metrics for Proof-of-Stake blockchains </p>
      {/*<p className="title">*/}
      {/*    This site is under maintenance. Please check after some time.*/}
      {/*</p>*/}
      <p className="content">
        See how resistant a chain is to censorship or collusion. Compare metrics, explore thresholds, export data.
      </p>
      <List data={sortedChains} />
      <button
        className="csv-btn"
        onClick={() => {
          const header = "Name,Current Value,Previous Value";
          const rows = sortedChains.map((c: any) => {
            const name = (c.results.name ?? "").replace(/,/g, "");
            const curr = c.results.currVal ?? 0;
            const prev = c.results.prevVal ?? 0;
            return `${name},${curr},${prev}`;
          });
          const csv = [header, ...rows].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "nakaflow-coefficients.csv";
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        Export CSV
      </button>
      <div>
        <p className="contentTitle">About the Nakamoto Coefficient</p>
        <p className="content">
          The <b>Nakamoto Coefficient</b> measures how many independent entities are required to control a critical share of a blockchain network (typically 33% for Proof-of-Stake systems). The higher the number, the harder it is for any small group to censor transactions or halt the chain. (i.e. the higher the Nakamoto Coefficient, the better.)
          <br /><br />
          While the concept is simple, <b>calculating it accurately is not</b>.
          <br /><br />
          In practice, Nakamoto Coefficient calculations rely on imperfect, publicly available data. It is often impossible to determine with certainty whether multiple validators are operated by the same underlying party. Additional factors such as validator geography, cloud infrastructure concentration, and shared operational dependencies can further influence decentralization without being directly observable on-chain.
        </p>
      </div>

      <div>
        <p className="contentTitle">
          Our Methodology for calculating the Nakamoto Coefficient
        </p>
        <div className="content">
          At Nakaflow, we calculate the Nakamoto Coefficient using the best available entity-level staking data. Instead of counting individual validator nodes in isolation, we aggregate stake by controlling entities, including:
          <ul>
          <li>Independent validator operators (e.g. Chainflow)</li>
          <li>Staking providers and pools (e.g. Lido)</li>
          <li>Other identifiable stake-controlling organizations</li>
          </ul>

          We then determine the minimum number of these entities required to reach the control threshold, based on their total staked share.
        </div>
      </div>

      <div>
        <p className="contentTitle">
          Important Limitations
        </p>
        <p className="content">
          Nakaflow's Nakamoto Coefficient should be understood as a conservative, data-driven estimate, not an absolute truth. Where ownership or control relationships cannot be verified, we rely on transparent assumptions and verifiable public information. Nakaflow does not currently account for geographic concentration, cloud infrastructure dependencies, or governance-layer centralization, which may further affect a network's real-world decentralization.
          <br /><br />
          Our goal is not to claim perfect certainty but to provide the clearest, most defensible view of real-world decentralization using available data.     
        </p>
      </div>

      <div>
        <p className="contentTitle">
          Improving the Nakamoto Coefficient on Your Networks
        </p>
        <p className="content">
          Improving a blockchain's Nakamoto Coefficient means reducing the concentration of control among a small number of large entities. In Proof-of-Stake networks, this is primarily influenced by how and where tokens are staked.
          <br /><br />
          The most effective way to increase the Nakamoto Coefficient is to distribute stake across a larger number of independent validator operators, rather than concentrating it with the largest stake holders.
        </p>
      </div>

      <div>
        <p className="contentTitle">
          Practical Ways to Improve the Nakamoto Coefficient
        </p>
        <div className="content">
          Token holders can directly influence network decentralization by adjusting their staking behavior. Two proven approaches are:

          <ol>
          <li><b>Stake with smaller, independent validators:</b> Use block explorers or staking dashboards to identify validator operators outside the top stake holders. Delegating stake to these operators helps reduce concentration and increases the number of entities required to reach control thresholds.</li>
          <li><b>Use Algorithmic or Distributed Stake Pools:</b> Some staking solutions automatically rebalance stake toward high-performing but smaller validators. These algorithmic stake pools are designed to optimize both performance and decentralization without requiring manual validator selection.</li>
          </ol>
        </div>
      </div>

      <div>
        <p className="contentTitle">
          Why This Matters
        </p>
        <p className="content">
          A higher Nakamoto Coefficient makes a network more resilient to censorship, collusion, and operational failure. While protocol design plays a role, staking decisions made by token holders are a major driver of real-world decentralization.
          <br /><br />
          By consciously distributing stake, participants contribute to stronger, more decentralized blockchain networks.
        </p>
      </div>

      <div>
        <p className="contentTitle">Contributors</p>
        <div className="content">
        Thank you to the following contributors who have submitted pull requests to add networks to Nakaflow.
          <ul>
            <li><a href="https://github.com/xenowits">xenowits</a> — Solana, Cosmos, Avalanche, Graph Protocol, Near, Polygon, Regen Network, Juno and Ethereum</li>
            <li><a href="https://github.com/Romainua">Romainua</a> — Sui</li>
            <li><a href="https://github.com/es92">es92</a> — Mina</li>
            <li><a href="https://github.com/jhernandezb">jhernandezb</a> — Stargaze</li>
            <li><a href="https://github.com/etienne-napoleone">etienne-napoleone</a> — Terra</li>
            <li><a href="https://github.com/swirlds-matt">swirlds-matt</a> — Hedera</li>
            <li><a href="https://github.com/BrazyDevelopment">BrazyDevelopment</a> — Nano</li>
          </ul>
        </div>
      </div>
     
      <div> 
        <p className="contentTitle">Support Nakaflow</p>
        <p className="content">
          Nakaflow is brought to you by{" "}
          <a href="https://chainflow.io/">Chainflow</a>, a crypto infrastructure
          company working to build the foundations for a more inclusive,
          equitable, and fair digital economy. Beyond Nakaflow, we operate
          validators on more than a dozen of the leading Proof-of-Stake networks
          and lead initiatives to support healthy, decentralized infrastructure
          ecosystems across crypto. <br />
          <br />
          Chainflow is a fully-independent team with no outside funding from
          Venture Capital or other specialist interests; we operate exclusively
          to serve our communities and advance a better future for the web.{" "}
          <br />
          <br />
          If you'd like to help keep projects like Nakaflow running and support
          our work, please consider staking with us on your networks of choice.
          You can learn more about how to do so at our{" "}
          <a href="https://chainflow.io/staking/">
            Staking Services page
          </a>
          . We sincerely appreciate your help in the movement for
          decentralization 🙏. <br />
        </p>
      </div>

      <style jsx>{`
        main {
          padding: 2rem 0 3rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .title {
          margin: 0 0 16px;
          line-height: 1.15;
          font-size: 4rem;
          font-weight: 700;
        }

        .title,
        .description {
          text-align: center;
          max-width: 800px;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
          margin: 4px 0 20px;
        }

        .contentTitle {
          text-align: left;
          font-weight: 800;
          line-height: 1.5;
          font-size: 1.5rem;
          margin: 4px 0 20px;
        }

        .content {
          line-height: 1.6;
          font-size: 1.2rem;
          margin: 4px 0 20px;
          max-width: 800px;
        }

        .csv-btn {
          margin: 12px 0 20px;
          padding: 8px 20px;
          font-size: 0.95rem;
          font-family: 'sofia-pro', sans-serif;
          background: #091636;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .csv-btn:hover {
          background: #1a2a50;
        }
      `}</style>
    </main>
  );
};

export default Home;
