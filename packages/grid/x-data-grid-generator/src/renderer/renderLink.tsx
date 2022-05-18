import * as React from 'react';
import { styled } from '@mui/material/styles';
import { GridRenderCellParams } from '@mui/x-data-grid-premium';

interface DemoLinkProps {
  href: string;
  children: string;
}

const Link = styled('a')({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  color: 'inherit',
});

export const DemoLink = React.memo(function DemoLink(props: DemoLinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Link tabIndex={-1} onClick={handleClick} href={props.href}>
      {props.children}
    </Link>
  );
});

export function renderLink(params: GridRenderCellParams<string, any, any>) {
  if (params.value == null) {
    return '';
  }

  return <DemoLink href={params.value}>{params.value}</DemoLink>;
}
