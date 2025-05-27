'use client'

import { useEffect, useState } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, TextField, MenuItem, Box, Button
} from '@mui/material'
import Link from 'next/link'

interface Vendor {
  vendor_id: string
  company_name: string
  contact_name: string
  phone_number: string
  email: string
  status: string
}

const ViewVendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/vendors/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token 989701b42872aae835d0decab95d24e81e6c2689'
          }
        })

        const data = await res.json()
        setVendors(data)
      } catch (err) {
        console.error('Error fetching vendors:', err)
      }
    }

    fetchData()
  }, [])

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch =
      vendor.vendor_id.toLowerCase().includes(search.toLowerCase()) ||
      vendor.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (vendor.phone_number || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || vendor.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return (
    <Box className='p-4'>
      <Box display='flex' justifyContent='space-between' alignItems='center' marginBottom={3}>
        <Typography variant='h5'>Vendors</Typography>
      </Box>

      <Box display='flex' justifyContent='space-between' alignItems='center' marginBottom={3} gap={2}>
        <Box display='flex' gap={2} flexGrow={1}>
          <TextField
            label='Search by ID, name or phone'
            variant='outlined'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />

          <TextField
            select
            label='Status'
            variant='outlined'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value='All'>All</MenuItem>
            <MenuItem value='Active'>Active</MenuItem>
            <MenuItem value='Inactive'>Inactive</MenuItem>
          </TextField>
        </Box>

        <Link href='/vendors/create' passHref>
          <Button variant='contained' color='primary'>Add Vendor</Button>
        </Link>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendor ID</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVendors.map(vendor => (
              <TableRow key={vendor.vendor_id}>
                <TableCell>{vendor.vendor_id}</TableCell>
                <TableCell>{vendor.company_name}</TableCell>
                <TableCell>{vendor.contact_name}</TableCell>
                <TableCell>{vendor.phone_number}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.status}</TableCell>
              </TableRow>
            ))}
            {filteredVendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align='center'>No vendors found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default ViewVendorsPage
