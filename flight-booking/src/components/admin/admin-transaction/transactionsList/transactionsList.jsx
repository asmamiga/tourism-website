import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Trash, Filter, Printer } from 'lucide-react';
import '../../styles/ListCommonStyle.css';
import './transactionsList.css';
import axiosApi from '../../../../api/axios';
import DeleteTransaction from '../delete-transaction/delete-transaction';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs';
import Loading from '../../loading/Loading';
import Pagination from '../../pagination/Pagination';
// import TransactionCharts from './TransactionCharts';

const TransactionList = () => {
  // const navigate = useNavigate();
  const printRef = useRef(null);
  
  // State management
  const [transactions, setTransactions] = useState([]);
  const [flights, setFlights] = useState([]);
  const [flightClasses, setFlightClasses] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [airports, setAirports] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [currentView, setCurrentView] = useState('list');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [filterOptions, setFilterOptions] = useState({
    flightId: 'all',
    paymentStatus: 'all'
  });

  // Load data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchTransactions(),
          fetchFlights(),
          fetchFlightClasses(),
          fetchPromoCodes()
        ]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Update total items count whenever filters or transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      const filteredItems = getAllFilteredTransactions();
      setTotalItems(filteredItems.length);
    }
  }, [transactions, filterOptions.flightId, filterOptions.paymentStatus]);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const response = await axiosApi.get('/transactions');
      if (Array.isArray(response)) {
        setTransactions(response);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      throw err;
    }
  };

  // Fetch promo codes from API
  const fetchPromoCodes = async () => {
    try {
      const response = await axiosApi.get('/promo-codes');
      if (Array.isArray(response.data)) {
        setPromoCodes(response.data);
      } else {
        throw new Error('Invalid promo codes data format received');
      }
    } catch (err) {
      console.error('Failed to fetch promo codes:', err);
    }
  };

  // Fetch flights from API
  const fetchFlights = async () => {
    try {
      const response = await axiosApi.get('/flights');
      if (Array.isArray(response)) {
        setFlights(response);
        
        // Extract airport information from flight data
        const airportData = {};
        response.forEach(flight => {
          if (flight.flight_segments) {
            flight.flight_segments.forEach(segment => {
              if (segment && segment.airport && segment.airport.id) {
                airportData[segment.airport.id] = segment.airport;
              }
            });
          }
        });
        setAirports(airportData);
      } else {
        throw new Error('Invalid flights data format received');
      }
    } catch (err) {
      console.error('Failed to fetch flights:', err);
    }
  };

  // Fetch flight classes from API
  const fetchFlightClasses = async () => {
    try {
      const response = await axiosApi.get('/flight-classes');
      if (Array.isArray(response)) {
        setFlightClasses(response);
      } else {
        throw new Error('Invalid flight classes data format received');
      }
    } catch (err) {
      console.error('Failed to fetch flight classes:', err);
    }
  };

  // Get flight class type by ID
  const getFlightClassName = (classId) => {
    if (!classId) return 'Unknown Class';
    const flightClass = flightClasses.find(fc => fc.id.toString() === classId.toString());
    return flightClass ? flightClass.class_type : 'Unknown Class';
  };

  // Get promo code by ID
  const getPromoCode = (promoCodeId) => {
    if (!promoCodeId) return 'None';
    const promoCode = promoCodes.find(pc => pc.id.toString() === promoCodeId.toString());
    return promoCode ? promoCode.code : 'Unknown';
  };

  // Get airport name helper function
  const getAirportName = (airportId) => {
    if (!airportId) return 'Unknown Airport';
    return airports[airportId]?.name || 'Unknown Airport';
  };

  // Get flight route description
  const getFlightRoute = (flightId) => {
    const flight = flights.find(f => f.id.toString() === flightId.toString());
    if (!flight) return 'Unknown Route';
    
    const segments = flight.flight_segments || [];
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    
    return `${flight.flight_number} - ${getAirportName(firstSegment?.airport_id)} to ${getAirportName(lastSegment?.airport_id)}`;
  };

  // Get all filtered transactions without pagination (for counts)
  const getAllFilteredTransactions = () => {
    return transactions.filter(transaction => {
      // Filter by flight
      if (filterOptions.flightId !== 'all' && transaction.flight_id.toString() !== filterOptions.flightId) {
        return false;
      }
      
      // Filter by payment status
      if (filterOptions.paymentStatus !== 'all' && transaction.payment_status !== filterOptions.paymentStatus) {
        return false;
      }
      
      return true;
    });
  };
  
  // Get filtered transactions with pagination (without setting state during render)
  const getFilteredTransactions = () => {
    const filtered = getAllFilteredTransactions();
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };
  
  // Calculate the filtered data once for this render
  const allFilteredTransactions = getAllFilteredTransactions();
  const paginatedTransactions = getFilteredTransactions();

  // Calculate totals for filtered transactions
  const calculateTotals = () => {
    const totalTransactions = allFilteredTransactions.length;
    const totalPending = allFilteredTransactions
      .filter(transaction => transaction.payment_status === 'pending')
      .reduce((sum, transaction) => sum + parseFloat(transaction.grandtotal || 0), 0);
    
    const totalPaid = allFilteredTransactions
      .filter(transaction => transaction.payment_status === 'paid')
      .reduce((sum, transaction) => sum + parseFloat(transaction.grandtotal || 0), 0);
      
    return { totalTransactions, totalPending, totalPaid };
  };

  const { totalTransactions, totalPending, totalPaid } = calculateTotals();

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilterOptions(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Navigation and CRUD operations
  // const handleEdit = (transaction) => {
  //   navigate(`/admin/transactions/${transaction.id}/edit`);
  // };

  const handleDelete = (transaction) => {
    setSelectedTransaction(transaction);
    setCurrentView('delete');
  };

  const handleMultiDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete the selected transactions?');
  
    if (isConfirmed) {
      try {
        const deletePromises = selectedTransactions.map(id => 
          axiosApi.delete(`/transactions/${id}`)
        );
        await Promise.all(deletePromises);
        fetchTransactions();
        setSelectedTransactions([]);
      } catch (err) {
        setError('Failed to delete transactions: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Checkbox selection handlers
  const handleCheckboxChange = (id) => {
    setSelectedTransactions((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === allFilteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(allFilteredTransactions.map((transaction) => transaction.id));
    }
  };

  // Print functionality using direct print method
  const handlePrintTransactions = () => {
    // Create a hidden iframe to print from
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Create the print content inside the iframe
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h2 { text-align: center; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; }
            .summary-cards { display: flex; justify-content: space-between; margin: 20px 0; }
            .card { border: 1px solid #ddd; padding: 15px; text-align: center; width: 30%; }
            .card-label { font-size: 14px; color: #666; margin-bottom: 5px; }
            .card-value { font-size: 18px; font-weight: bold; }
            .report-info { margin-bottom: 20px; }
            .report-date { text-align: right; font-style: italic; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <h1>Transaction Report</h1>
          <div class="report-info">
            <h2>${filterOptions.flightId === 'all' ? 'All Flights' : getFlightRoute(filterOptions.flightId)}</h2>
            <h3>${filterOptions.paymentStatus === 'all' ? 'All Payment Statuses' : `Payment Status: ${filterOptions.paymentStatus}`}</h3>
            <div class="report-date">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="summary-cards">
            <div class="card">
              <div class="card-label">Total Transactions</div>
              <div class="card-value">${totalTransactions}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Amount (Pending)</div>
              <div class="card-value">$ ${totalPending.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Amount (Paid)</div>
              <div class="card-value">$ ${totalPaid.toLocaleString()}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Flight</th>
                <th>Flight Class</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Passengers</th>
                <th>Promo Code</th>
                <th>Payment Status</th>
                <th>Subtotal</th>
                <th>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              ${allFilteredTransactions.map(transaction => `
                <tr>
                  <td>${transaction.code}</td>
                  <td>${getFlightRoute(transaction.flight_id)}</td>
                  <td>${getFlightClassName(transaction.flight_class_id)}</td>
                  <td>${transaction.name}</td>
                  <td>${transaction.email}</td>
                  <td>${transaction.phone}</td>
                  <td>${transaction.number_of_passengers}</td>
                  <td>${getPromoCode(transaction.promo_code_id)}</td>
                  <td>${transaction.payment_status}</td>
                  <td>$${parseFloat(transaction.subtotal).toLocaleString()}</td>
                  <td>$${parseFloat(transaction.grandtotal).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <script>
            // This script will trigger printing automatically when loaded
            window.onload = function() {
              window.print();
              setTimeout(function() {
                // Remove the iframe after printing is done or cancelled
                window.frameElement.remove();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `;
    
    // Write to iframe document and let its onload script handle printing
    iframe.contentDocument.open();
    iframe.contentDocument.write(printContent);
    iframe.contentDocument.close();
  };

  // Handle success after creation or deletion
  const handleSuccess = () => {
    fetchTransactions();
    setCurrentView('list');
    setSelectedTransaction(null);
  };

  // Render loading state
  if (loading) return (
    <div className="component-list-container">
      <Loading />
    </div>
  );
  
  // Render error state
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="component-list-container">
      <Breadcrumbs />
      <div className="component-list-header">
        <h1 className="transactions-title">Transactions</h1>
        {currentView === 'list' && (
          <div className="header-actions">
            <div className="filter-section">
              <span><Filter className="w-4 h-4" style={{ margin: '0 8px 8px 0' }}/></span>
              <select
                value={filterOptions.flightId}
                onChange={(e) => handleFilterChange('flightId', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Flights</option>
                {flights.map(flight => {
                  const segments = flight.flight_segments || [];
                  const firstSegment = segments.length > 0 ? segments[0] : null;
                  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
                  
                  return (  
                    <option key={flight.id} value={flight.id.toString()}>
                      {flight.flight_number} - 
                      {firstSegment && firstSegment.airport_id 
                        ? getAirportName(firstSegment.airport_id) 
                        : 'Unknown'} to {lastSegment && lastSegment.airport_id 
                        ? getAirportName(lastSegment.airport_id) 
                        : 'Unknown'}
                    </option>
                  );
                })}
              </select>
              
              <select
                value={filterOptions.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            
            <button
              onClick={handlePrintTransactions}
              className="print-button"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
            
            {selectedTransactions.length > 0 && (
              <button
                onClick={handleMultiDelete}
                className="delete-selected-button"
              >
                <Trash className="w-4 h-4" />
                Delete Selected
              </button>
            )}
          </div>
        )}
      </div>

      {currentView === 'delete' && selectedTransaction && (
        <DeleteTransaction
          transaction={selectedTransaction}
          onClose={() => setCurrentView('list')}
          onSuccess={handleSuccess}
        />
      )}

      {currentView === 'list' && (
        <>
          {allFilteredTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h2>No transactions found</h2>
              <p>Try changing your filter options or add a new transaction.</p>
            </div>
          ) : (
            <>
              <div className="transaction-totals">
                <div className="total-card">
                  <div className="total-label">Total Transactions</div>
                  <div className="total-Value">{totalTransactions}</div>
                </div>
                <div className="total-card">
                  <div className="total-label">Total Amount (Pending)</div>
                  <div className="total-Value">$ {totalPending.toLocaleString()}</div>
                </div>
                <div className="total-card">
                  <div className="total-label">Total Amount (Paid)</div>
                  <div className="total-Value">$ {totalPaid.toLocaleString()}</div>
                </div>
              </div>
              
              {/* {currentView === 'list' && filteredTransactions.length > 0 && (
                <TransactionCharts 
                  transactions={filteredTransactions} 
                  flights={flights} 
                  getFlightRoute={getFlightRoute} 
                />
              )} */}
              <div className="component-table-container" ref={printRef}>
                <table className="component-table">
                  <thead>
                    <tr>
                      <th className="no-print">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.length === allFilteredTransactions.length && allFilteredTransactions.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Code</th>
                      <th>Flight</th>
                      <th>Flight Class</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Passengers</th>
                      <th>Payment Status</th>
                      <th>Subtotal</th>
                      <th>Grand Total</th>
                      <th className="no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="no-print">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={() => handleCheckboxChange(transaction.id)}
                          />
                        </td>
                        <td>{transaction.code}</td>
                        <td>{getFlightRoute(transaction.flight_id)}</td>
                        <td>{getFlightClassName(transaction.flight_class_id)}</td>
                        <td>{transaction.name}</td>
                        <td>{transaction.email}</td>
                        <td>{transaction.phone}</td>
                        <td>{transaction.number_of_passengers}</td>
                        <td>
                          <span className={`status-badge status-${transaction.payment_status}`}>
                            {transaction.payment_status}
                          </span>
                        </td>
                        <td>${parseFloat(transaction.subtotal).toLocaleString()}</td>
                        <td>${parseFloat(transaction.grandtotal).toLocaleString()}</td>
                        <td className="no-print">
                          <div className="action-buttons">
                            {/* <button
                              onClick={() => handleEdit(transaction)}
                              className="edit-button"
                            >
                              <Pencil className="w-4 h-4" /> <span>Edit</span>
                            </button> */}
                            <button
                              onClick={() => handleDelete(transaction)}
                              className="delete-button"
                            >
                              <Trash className="w-4 h-4" /> <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination Component */}
                <Pagination 
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={totalItems}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionList;