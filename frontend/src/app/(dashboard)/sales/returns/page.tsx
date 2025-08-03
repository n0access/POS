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
  Checkbox,
  FormControlLabel,
  Divider,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AttachMoney as RefundIcon,
  Assignment as ProcessIcon,
  Print as PrintIcon
} from '@mui/icons-material'

interface Sale {
  id: number
  sale_id: string
  customer_name: string
  customer_email: string
  sale_date: string
  total_amount: number
  payment_method: string
  status: string
  items: SaleItem[]
}

interface SaleItem {
  id: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total: number
  quantity_returned: number
  quantity_available_for_return: number
}

interface Return {
  id: number
  return_id: string
  original_sale: Sale
  customer_name: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  reason: string
  reason_description: string
  total_return_amount: number
  refund_amount: number
  restocking_fee: number
  refund_method: string
  refund_processed: boolean
  created_at: string
  items: ReturnItem[]
}

interface ReturnItem {
  id: number
  original_sale_item: SaleItem
  quantity_returned: number
  total_return_amount: number
  return_to_stock: boolean
  condition: 'new' | 'used' | 'damaged' | 'defective'
}

const ReturnsPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Create Return State
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [searchSaleId, setSearchSaleId] = useState('')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [returnItems, setReturnItems] = useState<any[]>([])
  const [returnReason, setReturnReason] = useState('')
  const [returnDescription, setReturnDescription] = useState('')
  const [refundMethod, setRefundMethod] = useState('original_payment')
  const [restockingFee, setRestockingFee] = useState(0)

  // Process Return State
  const [processDialogOpen, setProcessDialogOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null)

  const API_BASE_URL = 'http://localhost:8000/api'

  const steps = ['Find Sale', 'Select Items', 'Return Details', 'Review & Submit']

  const reasonChoices = [
    { value: 'defective', label: 'Defective Product' },
    { value: 'wrong_item', label: 'Wrong Item' },
    { value: 'damaged', label: 'Damaged in Transit' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'customer_changed_mind', label: 'Customer Changed Mind' },
    { value: 'duplicate_order', label: 'Duplicate Order' },
    { value: 'other', label: 'Other' }
  ]

  const conditionChoices = [
    { value: 'new', label: 'New/Unused' },
    { value: 'used', label: 'Used - Good' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'defective', label: 'Defective' }
  ]

  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/returns/`, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to fetch returns')
      const data = await response.json()
      setReturns(data.results || data)
    } catch (err) {
      setError('Failed to load returns')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const searchSale = async () => {
    if (!searchSaleId.trim()) {
      setError('Please enter a sale ID')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sales/${searchSaleId}/`, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Sale not found')
      }

      const sale = await response.json()

      if (sale.status !== 'completed') {
        setError('Only completed sales can be returned')
        return
      }

      setSelectedSale(sale)
      setReturnItems(sale.items.map((item: SaleItem) => ({
        original_sale_item: item.id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        max_quantity: item.quantity_available_for_return,
        quantity_returned: 0,
        unit_price: item.unit_price,
        return_to_stock: true,
        condition: 'new',
        selected: false
      })))
      setActiveStep(1)
    } catch (err: any) {
      setError(err.message || 'Failed to find sale')
    }
  }

  const updateReturnItem = (index: number, field: string, value: any) => {
    const updated = [...returnItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === 'quantity_returned') {
      updated[index].total_return_amount = value * updated[index].unit_price
    }

    setReturnItems(updated)
  }

  const calculateTotalReturn = () => {
    return returnItems
      .filter(item => item.selected && item.quantity_returned > 0)
      .reduce((sum, item) => sum + (item.quantity_returned * item.unit_price), 0)
  }

  const handleCreateReturn = async () => {
    const selectedItems = returnItems.filter(item => item.selected && item.quantity_returned > 0)

    if (selectedItems.length === 0) {
      setError('Please select at least one item to return')
      return
    }

    if (!returnReason) {
      setError('Please select a return reason')
      return
    }

    try {
      const returnData = {
        original_sale: selectedSale?.id,
        reason: returnReason,
        reason_description: returnDescription,
        refund_method: refundMethod,
        restocking_fee: restockingFee,
        items: selectedItems.map(item => ({
          original_sale_item: item.original_sale_item,
          quantity_returned: item.quantity_returned,
          return_to_stock: item.return_to_stock,
          condition: item.condition
        }))
      }

      const response = await fetch(`${API_BASE_URL}/returns/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create return')
      }

      const result = await response.json()
      setSuccess(`Return created successfully! Return ID: ${result.return_id}`)
      resetCreateForm()
      setCreateDialogOpen(false)
      fetchReturns()
    } catch (err: any) {
      setError(err.message || 'Failed to create return')
    }
  }

  const handleProcessReturn = async (returnId: number, action: 'approve' | 'reject') => {
    try {
      let endpoint = `${API_BASE_URL}/returns/${returnId}/`
      let method = 'PATCH'
      let body = { status: action === 'approve' ? 'approved' : 'rejected' }

      if (action === 'approve') {
        endpoint = `${API_BASE_URL}/returns/${returnId}/process_return/`
        method = 'POST'
        body = {}
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to ${action} return`)
      }

      setSuccess(`Return ${action}d successfully`)
      fetchReturns()
      setProcessDialogOpen(false)
    } catch (err: any) {
      setError(err.message || `Failed to ${action} return`)
    }
  }

  const handleProcessRefund = async (returnId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/returns/${returnId}/process_refund/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to process refund')
      }

      const result = await response.json()
      setSuccess(`Refund processed successfully! Payment ID: ${result.payment_id}`)
      fetchReturns()
      setProcessDialogOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to process refund')
    }
  }

  const resetCreateForm = () => {
    setActiveStep(0)
    setSearchSaleId('')
    setSelectedSale(null)
    setReturnItems([])
    setReturnReason('')
    setReturnDescription('')
    setRefundMethod('original_payment')
    setRestockingFee(0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'info'
      case 'completed': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const renderCreateReturnDialog = () => (
    <Dialog
      open={createDialogOpen}
      onClose={() => setCreateDialogOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Create Return</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Find Original Sale</Typography>
            <TextField
              fullWidth
              label="Sale ID"
              value={searchSaleId}
              onChange={(e) => setSearchSaleId(e.target.value)}
              placeholder="Enter sale ID (e.g., SALE-0001)"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={searchSale}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            {selectedSale && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">Sale Details</Typography>
                  <Typography>Sale ID: {selectedSale.sale_id}</Typography>
                  <Typography>Customer: {selectedSale.customer_name}</Typography>
                  <Typography>Date: {new Date(selectedSale.sale_date).toLocaleDateString()}</Typography>
                  <Typography>Total: ${selectedSale.total_amount.toFixed(2)}</Typography>
                  <Typography>Payment Method: {selectedSale.payment_method}</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {activeStep === 1 && selectedSale && (
          <Box>
            <Typography variant="h6" gutterBottom>Select Items to Return</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Select</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Original Qty</TableCell>
                    <TableCell>Available for Return</TableCell>
                    <TableCell>Return Qty</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Return to Stock</TableCell>
                    <TableCell>Return Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returnItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox
                          checked={item.selected}
                          onChange={(e) => updateReturnItem(index, 'selected', e.target.checked)}
                          disabled={item.max_quantity === 0}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{item.product_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.product_sku}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.max_quantity + item.quantity_returned}</TableCell>
                      <TableCell>{item.max_quantity}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity_returned}
                          onChange={(e) => updateReturnItem(index, 'quantity_returned', Math.min(parseInt(e.target.value) || 0, item.max_quantity))}
                          disabled={!item.selected}
                          inputProps={{ min: 0, max: item.max_quantity }}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={item.condition}
                            onChange={(e) => updateReturnItem(index, 'condition', e.target.value)}
                            disabled={!item.selected}
                          >
                            {conditionChoices.map(choice => (
                              <MenuItem key={choice.value} value={choice.value}>
                                {choice.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={item.return_to_stock}
                          onChange={(e) => updateReturnItem(index, 'return_to_stock', e.target.checked)}
                          disabled={!item.selected || item.condition === 'defective'}
                        />
                      </TableCell>
                      <TableCell>
                        ${(item.quantity_returned * item.unit_price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6">
                Total Return Amount: ${calculateTotalReturn().toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Return Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Return Reason</InputLabel>
                  <Select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    label="Return Reason"
                  >
                    {reasonChoices.map(choice => (
                      <MenuItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Refund Method</InputLabel>
                  <Select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    label="Refund Method"
                  >
                    <MenuItem value="original_payment">Original Payment Method</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="store_credit">Store Credit</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason Description"
                  multiline
                  rows={3}
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  placeholder="Additional details about the return..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Restocking Fee"
                  type="number"
                  value={restockingFee}
                  onChange={(e) => setRestockingFee(parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>Review Return Request</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">Original Sale</Typography>
                    <Typography>Sale ID: {selectedSale?.sale_id}</Typography>
                    <Typography>Customer: {selectedSale?.customer_name}</Typography>
                    <Typography>Date: {selectedSale && new Date(selectedSale.sale_date).toLocaleDateString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">Return Details</Typography>
                    <Typography>Reason: {reasonChoices.find(r => r.value === returnReason)?.label}</Typography>
                    <Typography>Refund Method: {refundMethod.replace('_', ' ')}</Typography>
                    <Typography>Restocking Fee: ${restockingFee.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Items to Return</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Unit Price</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Condition</TableCell>
                        <TableCell>Return to Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {returnItems.filter(item => item.selected && item.quantity_returned > 0).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.quantity_returned}</TableCell>
                          <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                          <TableCell>${(item.quantity_returned * item.unit_price).toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={conditionChoices.find(c => c.value === item.condition)?.label}
                              size="small"
                              color={item.condition === 'new' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.return_to_stock ? 'Yes' : 'No'}
                              size="small"
                              color={item.return_to_stock ? 'success' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2">Return Amount: ${calculateTotalReturn().toFixed(2)}</Typography>
                  <Typography variant="body2">Restocking Fee: ${restockingFee.toFixed(2)}</Typography>
                  <Typography variant="h6">Net Refund: ${(calculateTotalReturn() - restockingFee).toFixed(2)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep(activeStep - 1)}>Back</Button>
        )}
        {activeStep < steps.length - 1 && (
          <Button
            variant="contained"
            onClick={() => setActiveStep(activeStep + 1)}
            disabled={
              (activeStep === 0 && !selectedSale) ||
              (activeStep === 1 && !returnItems.some(item => item.selected && item.quantity_returned > 0)) ||
              (activeStep === 2 && !returnReason)
            }
          >
            Next
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button variant="contained" onClick={handleCreateReturn}>
            Create Return
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )

  const renderProcessDialog = () => (
    <Dialog
      open={processDialogOpen}
      onClose={() => setProcessDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Process Return - {selectedReturn?.return_id}</DialogTitle>
      <DialogContent>
        {selectedReturn && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Return Information</Typography>
              <Typography>Return ID: {selectedReturn.return_id}</Typography>
              <Typography>Original Sale: {selectedReturn.original_sale.sale_id}</Typography>
              <Typography>Customer: {selectedReturn.customer_name}</Typography>
              <Typography>Reason: {selectedReturn.reason}</Typography>
              <Typography>Status: {selectedReturn.status}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Financial Details</Typography>
              <Typography>Return Amount: ${selectedReturn.total_return_amount.toFixed(2)}</Typography>
              <Typography>Restocking Fee: ${selectedReturn.restocking_fee.toFixed(2)}</Typography>
              <Typography>Net Refund: ${selectedReturn.refund_amount.toFixed(2)}</Typography>
              <Typography>Refund Method: {selectedReturn.refund_method}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Items</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Condition</TableCell>
                      <TableCell>Return to Stock</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedReturn.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.original_sale_item.product_name}</TableCell>
                        <TableCell>{item.quantity_returned}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.condition}
                            size="small"
                            color={item.condition === 'new' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.return_to_stock ? 'Yes' : 'No'}
                            size="small"
                            color={item.return_to_stock ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>${item.total_return_amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setProcessDialogOpen(false)}>Close</Button>
        {selectedReturn?.status === 'pending' && (
          <>
            <Button
              color="error"
              onClick={() => handleProcessReturn(selectedReturn.id, 'reject')}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              onClick={() => handleProcessReturn(selectedReturn.id, 'approve')}
            >
              Approve
            </Button>
          </>
        )}
        {selectedReturn?.status === 'approved' && !selectedReturn.refund_processed && (
          <Button
            variant="contained"
            onClick={() => handleProcessRefund(selectedReturn.id)}
            startIcon={<RefundIcon />}
          >
            Process Refund
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Returns & Refunds</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetCreateForm()
              setCreateDialogOpen(true)
            }}
          >
            Create Return
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="All Returns" />
              <Tab label="Pending" />
              <Tab label="Approved" />
              <Tab label="Completed" />
            </Tabs>

            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Return ID</TableCell>
                    <TableCell>Original Sale</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Return Amount</TableCell>
                    <TableCell>Refund Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returns
                    .filter(return_ => {
                      if (activeTab === 0) return true
                      if (activeTab === 1) return return_.status === 'pending'
                      if (activeTab === 2) return return_.status === 'approved'
                      if (activeTab === 3) return return_.status === 'completed'
                      return true
                    })
                    .map((return_) => (
                      <TableRow key={return_.id} hover>
                        <TableCell>{return_.return_id}</TableCell>
                        <TableCell>{return_.original_sale.sale_id}</TableCell>
                        <TableCell>{return_.customer_name}</TableCell>
                        <TableCell>{return_.reason.replace('_', ' ')}</TableCell>
                        <TableCell>${return_.total_return_amount.toFixed(2)}</TableCell>
                        <TableCell>${return_.refund_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={return_.status.toUpperCase()}
                            color={getStatusColor(return_.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(return_.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedReturn(return_)
                              setProcessDialogOpen(true)
                            }}
                            title="Process Return"
                          >
                            <ProcessIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {renderCreateReturnDialog()}
      {renderProcessDialog()}
    </Grid>
  )
}

export default ReturnsPage
