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
          Dashboard
        </MenuItem>

        <MenuItem href='/pos' icon={<i className='ri-shopping-cart-2-line' />}>
          Point of Sale
        </MenuItem>

        <SubMenu label='Sales' icon={<i className='ri-money-dollar-circle-line' />}>
  <MenuItem href='/sales/create'>Create Sale/Order</MenuItem>
  {/* ADD THIS */}
  <MenuItem href='/sales'>Sales History</MenuItem>
  <MenuItem href='/sales/quotes'>Quotes</MenuItem>
  {/* OPTIONALLY ADD THIS */}
  <MenuItem href='/sales/returns'>Returns & Refunds</MenuItem>
  <MenuItem href='/sales/invoices'>Invoices</MenuItem>
</SubMenu>

        <SubMenu label='Inventory' icon={<i className='ri-box-3-line' />}>
          <MenuItem href='/products'>Products</MenuItem>
          <MenuItem href='/categories'>Categories</MenuItem>
          <MenuItem href='/inventory'>Stock Levels</MenuItem>
          <MenuItem href='/inventory/adjustments'>Adjustments</MenuItem>
        </SubMenu>

        <SubMenu label='Purchasing' icon={<i className='ri-file-list-3-line' />}>
          <MenuItem href='/orders/create'>Create Order</MenuItem>
          <MenuItem href='/orders'>Purchase Orders</MenuItem>
          <MenuItem href='/orders/receive'>Receive Items</MenuItem>
          <MenuItem href='/vendors'>Vendors</MenuItem>
        </SubMenu>

        <SubMenu label='Customers' icon={<i className='ri-user-line' />}>
          <MenuItem href='/customers'>All Customers</MenuItem>
          <MenuItem href='/customers/groups'>Customer Groups</MenuItem>
          <MenuItem href='/loyalty'>Loyalty Program</MenuItem>
        </SubMenu>

        <SubMenu label='Staff' icon={<i className='ri-team-line' />}>
          <MenuItem href='/staff'>Team Members</MenuItem>
          <MenuItem href='/roles'>Roles & Permissions</MenuItem>
          <MenuItem href='/shifts'>Shift Management</MenuItem>
        </SubMenu>

        <SubMenu label='Reports' icon={<i className='ri-bar-chart-line' />}>
          <MenuItem href='/reports/sales'>Sales Reports</MenuItem>
          <MenuItem href='/reports/inventory'>Inventory Reports</MenuItem>
          <MenuItem href='/reports/financial'>Financial Summary</MenuItem>
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
