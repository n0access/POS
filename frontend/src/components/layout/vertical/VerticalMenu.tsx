'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: number
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuItem href='/dashboard' icon={<i className='ri-home-5-line' />}>
          Home
        </MenuItem>

        <MenuItem href='/items' icon={<i className='ri-box-3-line' />}>
          Items & Inventory
        </MenuItem>

        <MenuItem href='/orders' icon={<i className='ri-file-list-3-line' />}>
          Orders & Payments
        </MenuItem>

        <MenuItem href='/customers' icon={<i className='ri-user-line' />}>
          Customers
        </MenuItem>

        <MenuItem href='/reports' icon={<i className='ri-bar-chart-line' />}>
          Reports
        </MenuItem>

        <MenuItem href='/staff' icon={<i className='ri-team-line' />}>
          Staff
        </MenuItem>

        <MenuItem href='/banking' icon={<i className='ri-bank-line' />}>
          Banking
        </MenuItem>

        <MenuItem href='/settings' icon={<i className='ri-settings-3-line' />}>
          Settings
        </MenuItem>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
