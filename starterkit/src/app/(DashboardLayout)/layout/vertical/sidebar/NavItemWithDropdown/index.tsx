import React, { useState } from 'react';
import Link from 'next/link';

// mui imports
import {
  ListItemIcon,
  List,
  styled,
  ListItemText,
  Chip,
  useTheme,
  Typography,
  ListItemButton,
  useMediaQuery,
  Theme,
  Collapse,
  Box,
} from '@mui/material';
import { useSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';
import { AppState } from '@/store/store';
import { useContent } from '@/contexts/ContentContext';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

type NavGroup = {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
  children?: NavGroup[];
  chip?: string;
  chipColor?: any;
  variant?: string | any;
  external?: boolean;
  level?: number;
  onClick?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

interface ItemType {
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: any;
  level?: number | any;
  pathDirect: string;
}

export default function NavItemWithDropdown({ item, level, pathDirect, hideMenu, onClick }: ItemType) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const { setCurrentContent } = useContent();
  const [open, setOpen] = useState(false);

  const customizer = useSelector((state: AppState) => state.customizer);
  const Icon = item?.icon;
  const theme = useTheme();
  const { t } = useTranslation();
  const itemIcon =
    level > 1 ? <Icon stroke={1.5} size="1rem" /> : <Icon stroke={1.5} size="1.3rem" />;

  const handleClick = () => {
    if (item.children && item.children.length > 0) {
      setOpen(!open);
    } else {
      // Map href to content type
      const contentMap: { [key: string]: string } = {
        '/': 'dashboard',
        '/admin/project-details': 'project-details',
        '/admin/daily-reports': 'daily-reports',
        '/admin/weekly-reports': 'weekly-reports',
        '/admin/monthly-reports': 'monthly-reports',
        '/admin/employees': 'employees',
        '/admin/employee-list': 'employee-list',
      };
      
      const contentType = contentMap[item.href];
      if (contentType) {
        setCurrentContent(contentType as any);
      }
      
      if (onClick) {
        onClick();
      }
    }
  };

  const handleChildClick = (childItem: NavGroup) => {
    // Map href to content type
    const contentMap: { [key: string]: string } = {
      '/': 'dashboard',
      '/admin/project-details': 'project-details',
      '/admin/daily-reports': 'daily-reports',
      '/admin/weekly-reports': 'weekly-reports',
      '/admin/monthly-reports': 'monthly-reports',
      '/admin/employees': 'employees',
      '/admin/employee-list': 'employee-list',
    };
    
    const contentType = contentMap[childItem.href];
    if (contentType) {
      setCurrentContent(contentType as any);
    }
    
    if (onClick) {
      onClick();
    }
  };

  const ListItemStyled = styled(ListItemButton)(() => ({
    whiteSpace: 'nowrap',
    marginBottom: '10px',
    padding: '9.5px 12px',
    borderRadius: `${customizer.borderRadius}px`,
    backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
    color:
      level > 1 && pathDirect === item?.href
        ? `${theme.palette.primary.main}!important`
        : theme.palette.text.secondary,
    paddingLeft: hideMenu ? '10px' : level > 2 ? `${level * 15}px` : '10px',
    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
      color: theme.palette.secondary.main,
    },
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: theme.palette.secondary.main,
      '&:hover': {
        backgroundColor: theme.palette.secondary.main,
        color: 'white',
      },
    },
  }));

  const ChildListItemStyled = styled(ListItemButton)(() => ({
    whiteSpace: 'nowrap',
    marginBottom: '5px',
    padding: '6px 12px',
    borderRadius: `${customizer.borderRadius}px`,
    backgroundColor: 'transparent !important',
    color: pathDirect === item?.href
      ? `${theme.palette.primary.main}!important`
      : theme.palette.text.secondary,
    paddingLeft: hideMenu ? '10px' : `${(level || 1) * 15 + 20}px`,
    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
      color: theme.palette.secondary.main,
    },
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: theme.palette.secondary.main,
      '&:hover': {
        backgroundColor: theme.palette.secondary.main,
        color: 'white',
      },
    },
  }));

  const listItemProps: {
    component: any;
    href?: string;
    target?: any;
    to?: any;
  } = {
    component: item?.external ? 'a' : Link,
    to: item?.href,
    href: item?.external ? item?.href : '',
    target: item?.external ? '_blank' : '',
  };

  const hasChildren = item.children && item.children.length > 0;
  const isChildSelected = item.children?.some(child => pathDirect === child.href);

  return (
    <List component="li" disablePadding key={item?.id && item.title}>
      <ListItemStyled
        disabled={item?.disabled}
        selected={pathDirect === item?.href || isChildSelected}
        onClick={handleClick}
      >
        <ListItemIcon
          sx={{
            minWidth: '36px',
            p: '3px 0',
            color:
              level > 1 && pathDirect === item?.href
                ? `${theme.palette.primary.main}!important`
                : 'inherit',
          }}
        >
          {itemIcon}
        </ListItemIcon>
        <ListItemText>
          {hideMenu ? '' : <>{t(`${item?.title}`)}</>}
          <br />
          {item?.subtitle ? (
            <Typography variant="caption">{hideMenu ? '' : item?.subtitle}</Typography>
          ) : (
            ''
          )}
        </ListItemText>

        {!item?.chip || hideMenu ? null : (
          <Chip
            color={item?.chipColor}
            variant={item?.variant ? item?.variant : 'filled'}
            size="small"
            label={item?.chip}
          />
        )}

        {hasChildren && !hideMenu && (
          <Box sx={{ ml: 1 }}>
            {open ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </Box>
        )}
      </ListItemStyled>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child) => {
              const ChildIcon = child?.icon;
              const childIcon = <ChildIcon stroke={1.5} size="1rem" />;
              
              return (
                <List component="li" disablePadding key={child?.id && child.title}>
                  <ChildListItemStyled
                    disabled={child?.disabled}
                    selected={pathDirect === child?.href}
                    onClick={() => handleChildClick(child)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: '36px',
                        p: '3px 0',
                        color: pathDirect === child?.href
                          ? `${theme.palette.primary.main}!important`
                          : 'inherit',
                      }}
                    >
                      {childIcon}
                    </ListItemIcon>
                    <ListItemText>
                      {hideMenu ? '' : <>{t(`${child?.title}`)}</>}
                      <br />
                      {child?.subtitle ? (
                        <Typography variant="caption">{hideMenu ? '' : child?.subtitle}</Typography>
                      ) : (
                        ''
                      )}
                    </ListItemText>

                    {!child?.chip || hideMenu ? null : (
                      <Chip
                        color={child?.chipColor}
                        variant={child?.variant ? child?.variant : 'filled'}
                        size="small"
                        label={child?.chip}
                      />
                    )}
                  </ChildListItemStyled>
                </List>
              );
            })}
          </List>
        </Collapse>
      )}
    </List>
  );
}
