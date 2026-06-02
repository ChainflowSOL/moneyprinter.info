import React, { Fragment, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { usePlausible } from 'next-plausible';
import { Info } from 'react-feather';
import DetailsCard from './DetailsCard';

interface RowProps {
  protocol: any;
}

const toggle = (isOpen: boolean) => !isOpen;

const cardHeight = 5000;

const formatTvl = (tvl: number | undefined): string => {
  if (!tvl || tvl <= 0) return "TVL: not tracked on DefiLlama";
  if (tvl >= 1e9) return `TVL: $${(tvl / 1e9).toFixed(2)}B`;
  if (tvl >= 1e6) return `TVL: $${(tvl / 1e6).toFixed(2)}M`;
  if (tvl >= 1e3) return `TVL: $${(tvl / 1e3).toFixed(1)}K`;
  return `TVL: $${tvl.toFixed(0)}`;
};

const Row: React.FC<RowProps> = ({ protocol }) => {
  const plausible = usePlausible();
  const [open, setOpen] = useState(false);
  let isApp = true;

  return (
    <Fragment>
      {(!protocol.results.name) ? null: 
      <>
        <div
        onClick={() => {
          setOpen(toggle);
          plausible("open-details", {
            props: {
              label: protocol.results.name,
            },
          });
        }}
        aria-label={formatTvl(protocol.results.tvl)}
        className={`item ${isApp ? "app" : ""} ${open ? "open" : ""}`}
      >
        <div className="tvl-tooltip" role="tooltip">
          <span className="tvl-label">Total Value Locked</span>
          <span className={`tvl-value ${(!protocol.results.tvl || protocol.results.tvl <= 0) ? "muted" : ""}`}>
            {formatTvl(protocol.results.tvl).replace("TVL: ", "")}
          </span>
          <span className="tvl-source">via DefiLlama</span>
        </div>
        {protocol.results.icon && (
          <img
            src={protocol.results.icon}
            alt={`${protocol.results.name} logo`}
            width={20}
            height={20}
            loading="lazy"
            className="chain-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="name">
          {protocol.results.name}
          <span className={`info-icon ${open ? "active" : ""}`}><Info size={14} /></span>
          {protocol.results.stakingUrl && (
            <a
              className="stake-btn"
              href={protocol.results.stakingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                plausible("stake-click", {
                  props: { label: protocol.results.name },
                });
              }}
            >
              Stake {protocol.results.chainToken}
            </a>
          )}
        </div>
        <div className="amount">{protocol.results.currVal == undefined ? 0: protocol.results.currVal}</div>
        <div className="amount">{protocol.results.prevVal == undefined ? 0: protocol.results.prevVal}</div>
      </div>

      <CSSTransition in={open} timeout={500} unmountOnExit>
        <div className="details-container">
          <DetailsCard metadata={protocol.results.metadata} chainToken={protocol.results.chainToken} chainName={protocol.results.name} />
        </div>
      </CSSTransition>
      </>}
      <style jsx>{`
        .item {
          display: flex;
          padding: 0 4px;
          background-color: #fff;
          font-size: 18px;
          padding-left: 10px;
          color: black;
          text-decoration: none;
          align-items: center;
          height: 54px;
          position: relative;
        }

        .tvl-tooltip {
          position: absolute;
          top: -4px;
          left: 60px;
          transform: translateY(-100%);
          background: #091636;
          color: #fff;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-family: 'sofia-pro', sans-serif;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          z-index: 20;
          box-shadow: 0 6px 18px rgba(9, 22, 54, 0.25);
          display: flex;
          flex-direction: column;
          gap: 2px;
          line-height: 1.3;
          transition: opacity 0.15s ease 0s, visibility 0s linear 0.15s, transform 0.2s ease 0s;
        }
        .tvl-tooltip::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 18px;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #091636;
        }
        .tvl-label {
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.6;
          font-weight: 600;
        }
        .tvl-value {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
        }
        .tvl-value.muted {
          color: #a3aac2;
          font-weight: 500;
          font-size: 13px;
          font-style: italic;
        }
        .tvl-source {
          font-size: 10px;
          opacity: 0.5;
          margin-top: 2px;
        }
        .item:hover .tvl-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-100%) translateY(-4px);
          transition: opacity 0.18s ease 0.35s, visibility 0s linear 0.35s, transform 0.2s ease 0.35s;
        }
        @media (hover: none) {
          .tvl-tooltip { display: none; }
        }
        @media (max-width: 500px) {
          .tvl-tooltip { display: none; }
        }
        .chain-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .stake-btn {
          margin-left: 8px;
          padding: 3px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          background: #4a6cf7;
          border-radius: 4px;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s ease;
        }
        .stake-btn:hover {
          background: #3553d1;
        }
        @media (max-width: 500px) {
          .stake-btn {
            padding: 2px 6px;
            font-size: 11px;
            margin-left: 4px;
          }
        }
        .item:hover {
          background-color: #f5f5f5;
        }

        .item.app {
          background-color: #fad3f6;
        }
        .item.app:hover {
          background-color: #f8c3f3;
        }

        .name {
          flex: 1;
          padding-left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .amount {
          padding-left: 32px;
        }

        .amount {
          min-width: 200px;
          text-align: right;
          padding-right: 32px;
          font-family: "Noto Sans TC", sans-serif;
        }

        .info-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 5px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          opacity: 0.4;
          transition: opacity 0.2s ease, background-color 0.2s ease;
          cursor: pointer;
          flex-shrink: 0;
          line-height: 0;
        }
        .info-icon:hover {
          opacity: 0.8;
          background-color: rgba(0, 0, 0, 0.06);
        }
        .info-icon.active {
          opacity: 1;
          color: #29221F;
          background-color: #E1E3E6;
        }

        @keyframes slidein {
          from {
            max-height: 0px;
            opacity: 0;
          }

          to {
            max-height: ${cardHeight}px;
            opacity: 1;
          }
        }

        @keyframes slideout {
          from {
            max-height: ${cardHeight}px;
            opacity: 1;
          }

          to {
            max-height: 0px;
            opacity: 0;
          }
        }

        .details-container {
          max-height: none;
          animation: 0.5s 1 slidein;
          overflow: visible;

          border-top: solid 1px #e3e3e3;
          border-bottom: solid 1px #e3e3e3;
          display: flex;
          flex-direction: column;
        }

        .details-container.exit {
          max-height: 0;
          overflow: hidden;
          animation: 0.5s 1 slideout;
        }

        @media (max-width: 700px) {
          .amount {
            font-size: 14px;
            min-width: 110px;
            padding-left: 8px;
            padding-right: 2px;
          }

          .item {
            padding-left: 6px;
          }

          .info-icon {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 500px) {
          .name {
            padding-left: 8px;
          }
          .amount {
            min-width: 80px;
            padding-left: 20px;
            padding-right: 2px;
          }
          .info-icon {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </Fragment>
  );
};

export default Row;