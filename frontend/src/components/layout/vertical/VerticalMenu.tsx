'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

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

        <SubMenu label='Items & Inventory' icon={<i className='ri-box-3-line' />}>
          <MenuItem href='/items'>Items</MenuItem>
          <MenuItem href='/items/create'>Add New Item</MenuItem>
          <MenuItem href='/inventory'>Inventory Management</MenuItem>
        </SubMenu>

        <SubMenu label='Orders & Payments' icon={<i className='ri-file-list-3-line' />}>
           <MenuItem href='/orders/create'>Create Purchase Order</MenuItem>
           <MenuItem href='/orders'>View Purchase Orders</MenuItem>
           <MenuItem href='/orders/receive'>Receive Items</MenuItem>
        </SubMenu>
      <SubMenu label='Vendors' icon={<i className='ri-truck-line' />}>
  <MenuItem href='/vendors'>View Vendors</MenuItem>
  <MenuItem href='/vendors/create'>Add Vendor</MenuItem>
</SubMenu>
        <MenuItem href='/customers' icon={<i className='ri-user-line' />}>
          Customers
        </MenuItem>

        <MenuItem href='/reports' icon={<i className='ri-bar-chart-line' />}>
          Reports
        </MenuItem>

        <SubMenu label='Staff' icon={<i className='ri-team-line' />}>
          <MenuItem href='/staff'>Team Members</MenuItem>
          <MenuItem href='/roles'>Roles & Permissions</MenuItem>
        </SubMenu>

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
