import { Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProposalDetailModal from '../../components/modals/proposal-detail-modal';
import { ProposalCardItem } from '../../types';
import { useProposals } from '../../hooks/use-proposals';

export default function ProposalsPage() {
  const { search } = useOutletContext<{ search: string }>();
  const { proposalBoard, aprovarProposta, recusarProposta } = useProposals();
  const [selectedProposalDetail, setSelectedProposalDetail] = useState<(ProposalCardItem & { stage: string }) | null>(null);

  const searchTerm = search.trim().toLowerCase();
  const filteredProposalColumns = useMemo(
    () =>
      proposalBoard.map((column) => ({
        ...column,
        items: column.items.filter((item) =>
          !searchTerm || `${item.company} ${item.tag} ${item.amount}`.toLowerCase().includes(searchTerm)
        ),
      })),
    [proposalBoard, searchTerm]
  );

  return (
    <>
      <section className="panel stacked-panel">
        <div className="section-topbar">
          <div>
            <h3>Propostas comerciais</h3>
            <span>Acompanhamento rápido das oportunidades</span>
          </div>
        </div>

        <div className="proposal-board">
          {filteredProposalColumns.map((column) => (
            <section key={column.title} className="proposal-column">
              <div className="proposal-column-header">{column.title}</div>
              <div className="proposal-column-list">
                {column.items.map((item, index) => (
                  <article key={`${column.title}-${item.company}-${index}`} className="proposal-card">
                    <div className="proposal-card-top">
                      <strong>{item.company}</strong>
                      <small>{item.amount}</small>
                    </div>
                    <div className="proposal-card-middle">
                      <span className={`proposal-chip proposal-chip--${item.tag.toLowerCase()}`}>{item.tag}</span>
                    </div>
                    <div className="proposal-card-bottom">
                      <span className="proposal-card-avatar">M</span>
                      <small>{item.createdLabel}</small>
                    </div>
                    <Tooltip title="Ver detalhes" arrow>
                      <button
                        type="button"
                        className="icon-button detail-icon-button"
                        onClick={() => setSelectedProposalDetail({ ...item, stage: column.title })}
                      >
                        ⌕
                      </button>
                    </Tooltip>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <ProposalDetailModal
        detail={selectedProposalDetail}
        onClose={() => setSelectedProposalDetail(null)}
        onApprove={aprovarProposta}
        onReject={recusarProposta}
      />
    </>
  );
}