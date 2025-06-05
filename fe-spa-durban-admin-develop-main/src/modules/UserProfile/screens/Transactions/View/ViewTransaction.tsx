import React from 'react';

const ViewTransaction = () => {
  return (
    <div>
      <p className="border-b p-2">Transaction Details</p>
      <div className="flex justify-between v border-b">
        <div>
          <p className="font-medium">VHI Skin & Spa</p>
          <p>
            98 Cannon Avenue, Overport 1st Floor Sparks Lifestyle Centre ,
            Durban , SA
          </p>
          <p>Phone: Cell Line/Whatsapp/S</p>
          <p>Email: info5@spadurban.co.za</p>
        </div>
        <div>
          <p className="font-medium">Walk-in Client</p>
          <p>Phone: 0987654321</p>
          <p>Email: example@example.com</p>
        </div>
      </div>
      <div className="flex justify-between v border-b">
        <div>
          <p className="font-medium">Debit : 0.00</p>
          <p>Credit : 30.00</p>
          <p>Type : Income</p>
        </div>
        <div>
          <p className="font-medium">Date : 2024-03-02</p>
          <p>ID : TRN#3</p>
          <p>Category : Sales</p>
        </div>
      </div>
      <div>Note : #1003-Cash</div>
    </div>
  );
};

export default ViewTransaction;
