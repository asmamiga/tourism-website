import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Breadcrumps.css';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Comprehensive mapping of path segments to display labels
  const pathLabels = {
    // Main sections
    admin: 'Admin',
    dashboard: 'Dashboard',
    
    // Flights
    'admin-flight': 'Flights',
    'create-flight': 'Create Flight',
    'edit-flight': 'Edit Flight',
    'delete-flight': 'Delete Flight',
    'flightList': 'Flight List',
    'flightDetails': 'Flight Details',
    
    // Airlines
    'admin-airline': 'Airlines',
    'create-airline': 'Create Airline',
    'edit-airline': 'Edit Airline',
    'delete-airline': 'Delete Airline',
    'airlineList': 'Airline List',
    
    // Airports
    'admin-airport': 'Airports',
    'create-airport': 'Create Airport',
    'edit-airport': 'Edit Airport',
    'delete-airport': 'Delete Airport',
    'airportList': 'Airport List',
    
    // Facilities
    'admin-facilities': 'Facilities',
    'create-facility': 'Create Facility',
    'edit-facility': 'Edit Facility',
    'delete-facility': 'Delete Facility',
    'facilityList': 'Facility List',
    
    // Transactions
    'admin-transaction': 'Transactions',
    'create-transaction': 'Create Transaction',
    'edit-transaction': 'Edit Transaction',
    'delete-transaction': 'Delete Transaction',
    'transactionsList': 'Transaction List',
    
    // Promo Codes
    'admin-promo-code': 'Promo Codes',
    'create-promo-code': 'Create Promo Code',
    'edit-promo-code': 'Edit Promo Code',
    'delete-promo-code': 'Delete Promo Code',
    'promoCodeList': 'Promo Code List',
  };

  // Build the breadcrumb trail
  const breadcrumbs = pathnames.map((path, index) => {
    // Build the URL for this breadcrumb
    const url = `/${pathnames.slice(0, index + 1).join('/')}`;
    
    // Get the display label for this path segment
    const label = pathLabels[path] || path.charAt(0).toUpperCase() + path.slice(1);
    
    // Is this the last item in the breadcrumb trail?
    const isLast = index === pathnames.length - 1;

    return {
      label,
      url,
      isLast
    };
  });

  return (
    <div className="breadcrumbs">
      {breadcrumbs.map(({ label, url, isLast }, index) => (
        <React.Fragment key={url}>
          {index > 0 && <span className="breadcrumb-separator">{'>'}</span>}
          {isLast ? (
            <span className="breadcrumb-item active">{label}</span>
          ) : (
            <Link to={url} className="breadcrumb-item">{label}</Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;