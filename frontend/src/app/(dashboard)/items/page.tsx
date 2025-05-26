'use client'

import { useEffect, useState } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Button, TablePagination
} from '@mui/material'

type Item = {
  item_id: number
  item_name: string
  barcode: string
  product_category: string
  unit_price: string
  quantity: string
  status: string
}

const ItemsPage = () => {
  const [items, setItems] = useState<Item[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/inventory/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token 989701b42872aae835d0decab95d24e81e6c2689'
          }
        })

        if (!res.ok) return
        const data = await res.json()

        if (Array.isArray(data)) {
          setItems(data)
        } else if (Array.isArray(data.results)) {
          setItems(data.results)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      }
    }

    fetchData()
  }, [])

  // Event handlers for pagination
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <div className='p-4'>
      <Typography variant='h5' gutterBottom>Items</Typography>
      <Button variant='contained' color='primary' className='mb-4'>Add New Item</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Barcode</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(item => (
              <TableRow key={item.item_id}>
                <TableCell>{item.item_name}</TableCell>
                <TableCell>{item.barcode}</TableCell>
                <TableCell>{item.product_category}</TableCell>
                <TableCell>${Number(item.unit_price).toFixed(2)}</TableCell>
                <TableCell>{Number(item.quantity)}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align='center'>No items found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Control */}
      <TablePagination
        component='div'
        count={items.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 15, 25, 50]}
      />
    </div>
  )
}

export default ItemsPage
