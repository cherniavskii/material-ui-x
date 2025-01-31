import * as React from 'react';
import { styled, keyframes } from '@mui/system';

export interface GridSidebarScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const reveal = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const detectScroll = keyframes({ 'from, to': { '--scrollable': '" "' } });

const ScrollArea = styled('div')({
  animation: detectScroll,
  animationTimeline: '--scroll-timeline',
  animationFillMode: 'none',
  boxSizing: 'border-box',
  overflow: 'auto',
  scrollTimeline: '--scroll-timeline block',
  '&::before, &::after': {
    content: '""',
    flexShrink: 0,
    display: 'block',
    position: 'sticky',
    left: 0,
    right: 0,
    height: '4px',
    animation: `${reveal} linear both`,
    animationTimeline: '--scroll-timeline',

    // Custom property toggle trick:
    // - Detects if the element is scrollable
    // - https://css-tricks.com/the-css-custom-property-toggle-trick/
    '--visibility-scrollable': 'var(--scrollable) visible',
    '--visibility-not-scrollable': 'hidden',
    visibility: 'var(--visibility-scrollable, var(--visibility-not-scrollable))',
  },
  '&::before': {
    top: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0, transparent 100%)',
    animationRange: '0 4px',
  },
  '&::after': {
    bottom: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.05) 0, transparent 100%)',
    animationDirection: 'reverse',
    animationRange: 'calc(100% - 4px) 100%',
  },
});

export function GridSidebarScrollArea(props: GridSidebarScrollAreaProps) {
  const { children, ...rest } = props;
  return <ScrollArea {...rest}>{children}</ScrollArea>;
}
