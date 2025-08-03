'use client'

import { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  InputAdornment
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface Sale {
  id: number
  sale_id: string
  customer?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  customer_name: string
  total_amount: number
  subtotal: number
  discount_amount: number
  tax_amount: number
  payment_method: string
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
  items: SaleItem[]
  notes?: string
}

interface SaleItem {
  id: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total: number
}

const SalesHistoryPage = () => {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [dateFromFilter, setDateFromFilter] = useState<Date | null>(null)
  const [dateToFilter, setDateToFilter] = useState<Date | null>(null)

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const API_BASE_URL = 'http://localhost:8000/api'

  useEffect(() => {
    fetchSales()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [sales, searchTerm, statusFilter, paymentMethodFilter, dateFromFilter, dateToFilter])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/sales/`, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) throw new Error('Failed to fetch sales')

      const data = await response.json()
      setSales(data.results || data)
    } catch (err) {
      setError('Failed to load sales history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = sales

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.sale_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer?.email && sale.customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter)
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(sale => sale.payment_method === paymentMethodFilter)
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter(sale =>
        new Date(sale.created_at) >= dateFromFilter
      )
    }

    if (dateToFilter) {
      filtered = filtered.filter(sale =>
        new Date(sale.created_at) <= dateToFilter
      )
    }

    setFilteredSales(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'cancelled': return 'error'
      case 'refunded': return 'info'
      default: return 'default'
    }
  }

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale)
    setDetailsDialogOpen(true)
  }

  const handlePrintReceipt = async (saleId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales/${saleId}/receipt/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        }
      })

      if (!response.ok) throw new Error('Failed to generate receipt')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      setError('Failed to print receipt')
      console.error(err)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales/export/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
      })

      if (!response.ok) throw new Error('Failed to export data')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sales_history_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
    } catch (err) {
      setError('Failed to export data')
      console.error(err)
    }
  }

  const paginatedSales = filteredSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4">Sales History</Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportData}
            >
              Export Data
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        </Grid>

        {/* Filters */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <FilterIcon sx={{ mr: 1 }} />
                Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search by sale ID, customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="refunded">Refunded</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
                      label="Payment Method"
                    >
                      <MenuItem value="all">All Methods</MenuItem>
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                      <MenuItem value="mobile_money">Mobile Money</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="From Date"
                    value={dateFromFilter}
                    onChange={(newValue) => setDateFromFilter(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="To Date"
                    value={dateToFilter}
                    onChange={(newValue) => setDateToFilter(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sale ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSales.map((sale) => (
                      <TableRow key={sale.id} hover>
                        <TableCell>{sale.sale_id}</TableCell>
                        <TableCell>{sale.customer_name}</TableCell>
                        <TableCell>
                          {new Date(sale.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${sale.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={sale.payment_method.replace('_', ' ').toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sale.status.toUpperCase()}
                            color={getStatusColor(sale.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(sale)}
                            title="View Details"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handlePrintReceipt(sale.id)}
                            title="Print Receipt"
                          >
                            <PrintIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredSales.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sale Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Sale Details - {selectedSale?.sale_id}</DialogTitle>
          <DialogContent>
            {selectedSale && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Customer Information</Typography>
                  <Typography>{selectedSale.customer_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSale.customer?.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Sale Information</Typography>
                  <Typography>Date: {new Date(selectedSale.created_at).toLocaleString()}</Typography>
                  <Typography>Payment: {selectedSale.payment_method}</Typography>
                  <Typography>Status: {selectedSale.status}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Items</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>SKU</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Unit Price</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSale.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.product_sku}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                            <TableCell>${item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2">
                      Subtotal: ${selectedSale.subtotal.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Discount: ${selectedSale.discount_amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Tax: ${selectedSale.tax_amount.toFixed(2)}
                    </Typography>
                    <Typography variant="h6">
                      Total: ${selectedSale.total_amount.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                {selectedSale.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Notes</Typography>
                    <Typography variant="body2">{selectedSale.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => selectedSale && handlePrintReceipt(selectedSale.id)}
            >
              Print Receipt
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </LocalizationProvider>
  )
}

export default SalesHistoryPage
