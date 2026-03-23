import React, { useEffect, useState } from 'react';
import Attribute from './Attribute';

interface ValidatorInfo {
  pubkey: string;
  moniker: string;
  stake_sol: number;
}

interface EntityDetail {
  rank: number;
  name: string;
  stake_sol: number;
  percent: number;
  cumulative: number;
  commission: number;
  skip_rate: number;
  is_verified: boolean;
  is_hardcoded: boolean;
  validators: ValidatorInfo[];
}

const EntityRow: React.FC<{ entity: EntityDetail }> = ({ entity }) => {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !entity.is_hardcoded && entity.validators && entity.validators.length > 1;

  return (
    <>
      <tr
        className={canExpand ? 'expandable' : ''}
        onClick={() => canExpand && setExpanded(!expanded)}
      >
        <td className="col-rank">{entity.rank}</td>
        <td className="col-name">
          {canExpand && (
            <span className="expand-icon">{expanded ? '▾' : '▸'}</span>
          )}
          {entity.name}
          {canExpand && (
            <span className="validator-count">{entity.validators.length} validators</span>
          )}
        </td>
        <td className="col-num">{(entity.stake_sol / 1e6).toFixed(2)}M</td>
        <td className="col-num">{entity.percent.toFixed(2)}%</td>
        <td className="col-num">{entity.cumulative.toFixed(2)}%</td>
      </tr>
      {expanded && entity.validators.map((v, idx) => (
        <tr key={idx} className="validator-row">
          <td className="col-rank"></td>
          <td className="col-name validator-detail">
            <div className="validator-moniker">{v.moniker || '—'}</div>
            <div
              className="validator-pubkey"
              // title={`copy!`}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(v.pubkey);
                const el = e.currentTarget;
                const orig = el.textContent;
                el.textContent = 'Copied!';
                setTimeout(() => { el.textContent = orig; }, 1500);
              }}
            >
              {v.pubkey.slice(0, 8)}...{v.pubkey.slice(-6)}
            </div>
          </td>
          <td className="col-num validator-stake">{(v.stake_sol / 1e6).toFixed(4)}M</td>
          <td className="col-num"></td>
          <td className="col-num"></td>
        </tr>
      ))}
      <style jsx>{`
        tr.expandable {
          cursor: pointer;
        }
        tr.expandable:hover {
          background: #f0f4ff;
        }
        .expand-icon {
          display: inline-block;
          width: 16px;
          font-size: 11px;
          color: #4a6cf7;
        }
        .col-rank {
          width: 40px;
          text-align: center;
        }
        .col-name {
          text-align: left;
        }
        .col-num {
          width: 110px;
          text-align: right;
          font-family: 'Noto Sans TC', monospace;
          white-space: nowrap;
        }
        .verified {
          margin-left: 4px;
          font-size: 12px;
        }
        .validator-count {
          margin-left: 6px;
          font-size: 11px;
          color: #888;
          background: #f0f0f0;
          padding: 1px 6px;
          border-radius: 8px;
        }
        .validator-row {
          background: #f8f9fc;
        }
        .validator-row:hover {
          background: #f0f2f8;
        }
        .validator-detail {
          padding-left: 28px !important;
        }
        .validator-moniker {
          font-size: 13px;
          color: #333;
          font-weight: 500;
        }
        .validator-pubkey {
          font-size: 12px;
          color: #666;
          font-family: 'Courier New', monospace;
          cursor: pointer;
          display: inline-block;
        }
        .validator-stake {
          font-size: 13px;
          color: #444;
        }
        td {
          padding: 6px 12px;
          border-bottom: 1px solid #eee;
          color: #444;
        }
      `}</style>
    </>
  );
};

const EntityTable: React.FC<{ endpoint: string }> = ({ endpoint }) => {
  const [entities, setEntities] = useState<EntityDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      // console.log('Fetched entity details:', res)
      .then((data) => {
        setEntities(data.entities || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [endpoint]);

  if (loading) return <div className="table-status">Loading entity data...</div>;
  if (error) return <div className="table-status">Failed to load entity data.</div>;
  if (!entities.length) return null;

  const superminority = entities.filter((e, idx) => {
    if (e.cumulative <= 33.33) return true;
    if (idx > 0 && entities[idx - 1].cumulative <= 33.33) return true;
    return false;
  });

  return (
    <div className="entity-table-wrapper">
      <div className="table-title">
        Superminority Entities ({superminority.length} entities controlling 33% of stake)
      </div>
      <div className="table-hint">Click an entity with multiple validators to expand the breakdown</div>
      <div className="table-scroll">
        <table className="entity-table">
          <thead>
            <tr>
              <th className="col-rank">#</th>
              <th className="col-name">Entity</th>
              <th className="col-num">Stake (SOL)</th>
              <th className="col-num">Share %</th>
              <th className="col-num">Cumul. %</th>
            </tr>
          </thead>
          <tbody>
            {superminority.map((e) => (
              <EntityRow key={e.rank} entity={e} />
            ))}
          </tbody>
        </table>
      </div>


      <style jsx>{`
        .entity-table-wrapper {
          margin-top: 12px;
        }
        .table-title {
          font-weight: 600;
          font-size: 14px;
          color: #1a1a2e;
          margin-bottom: 4px;
        }
        .table-hint {
          font-size: 12px;
          color: #888;
          margin-bottom: 8px;
        }
        .table-scroll {
          overflow-x: auto;
          border: 1px solid #ddd;
          border-radius: 6px;
        }
        .entity-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          table-layout: fixed;
        }
        .entity-table th {
          background: #eef1f6;
          padding: 8px 12px;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #ccc;
          white-space: nowrap;
        }
        .col-rank {
          width: 40px;
          text-align: center;
        }
        .col-name {
          text-align: left;
        }
        .col-num {
          width: 110px;
          text-align: right;
          font-family: 'Noto Sans TC', monospace;
          white-space: nowrap;
        }
        th.col-num {
          text-align: right;
        }
        .verified {
          font-size: 12px;
        }
        .table-legend {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #666;
          margin-top: 6px;
          flex-wrap: wrap;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .legend-badge {
          font-size: 11px;
          color: #888;
          background: #f0f0f0;
          padding: 1px 6px;
          border-radius: 8px;
        }
        .table-status {
          font-size: 13px;
          color: #888;
          padding: 12px 0;
        }
      `}</style>
    </div>
  );
};

const DetailsCard: React.FC<{ metadata: any }> = ({ metadata }) => {
  const [entityCount, setEntityCount] = useState<number | null>(null);

  // Fetch entity count for the remark text replacement
  useEffect(() => {
    if (metadata.entityDetailsEndpoint) {
      fetch(metadata.entityDetailsEndpoint)
        .then((res) => res.json())
        .then((data) => {
          const entities: EntityDetail[] = data.entities || [];
          const count = entities.filter((e: EntityDetail, idx: number) => {
            if (e.cumulative <= 33.33) return true;
            if (idx > 0 && entities[idx - 1].cumulative <= 33.33) return true;
            return false;
          }).length;
          setEntityCount(count);
        })
        .catch(() => {});
    }
  }, [metadata.entityDetailsEndpoint]);

  const renderRemark = (text: string) => {
    const replaced = entityCount !== null
      ? text.replace('{count}', String(entityCount))
      : text.replace('{count}', '...');

    // Split on \n for paragraphs, and linkify URLs
    const paragraphs = replaced.split('\n').filter((p) => p.trim() !== '');
    return paragraphs.map((p, i) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = p.split(urlRegex);
      return (
        <p key={i} style={{ margin: i === 0 ? 0 : '10px 0 0' }}>
          {parts.map((part, j) =>
            urlRegex.test(part) ? (
              <a key={j} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#4a6cf7' }}>
                {part}
              </a>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="details-card">
      <div className="metadata">
        {metadata.description && <div className="description">{metadata.description}</div>}

        <div className="row">
          {metadata.website && (
            <Attribute title="Website">
              <a href={metadata.website} target="website">
                {metadata.website.replace('https://', '')}
              </a>
            </Attribute>
          )}
          {metadata.blockchain && <Attribute title="Blockchain">{metadata.blockchain}</Attribute>}
        </div>

        {metadata.remark && (
          <div className="remark">
            <div className="remark-header">
              <span className="remark-icon">ℹ️</span>
              <span>Why Our Number Differs From Other Trackers</span>
            </div>
            <div className="remark-body">{renderRemark(metadata.remark)}</div>
          </div>
        )}

        {metadata.entityDetailsEndpoint && (
          <EntityTable endpoint={metadata.entityDetailsEndpoint} />
        )}

        <div className="spacer" />
      </div>

      <style jsx>{`
        .details-card {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .metadata {
          padding: 12px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .description {
          margin: 4px 0;
        }
        .row {
          display: flex;
        }
        .row > :global(div) {
          flex: 1;
        }
        .spacer {
          flex: 1;
        }
        .remark {
          margin: 12px 0 4px;
          padding: 12px 16px;
          background: #f0f4ff;
          border-left: 4px solid #4a6cf7;
          border-radius: 0 6px 6px 0;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
        }
        .remark-header {
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
          color: #1a1a2e;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .remark-icon {
          font-size: 16px;
        }
        .remark-body {
          color: #444;
        }
      `}</style>
    </div>
  );
};

export default DetailsCard;