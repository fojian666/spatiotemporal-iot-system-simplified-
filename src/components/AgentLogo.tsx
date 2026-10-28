import type { CSSProperties } from 'react';

export const AgentLogo = ({ color = '#18a4b8', small = false }: { color?: string; small?: boolean }) => (
  <span className={`agent-logo ${small ? 'agent-logo-small' : ''}`} style={{ '--agent-color': color } as CSSProperties} aria-hidden="true">
    <span /><span />
  </span>
);
