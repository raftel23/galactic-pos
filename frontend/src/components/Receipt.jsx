import React from 'react';

/**
 * @description Renders a print-ready 80mm thermal receipt.
 * @param {{ transaction: object }} props - The completed transaction data.
 */
const Receipt = ({ transaction }) => {
    if (!transaction) return null;
    const date = new Date(transaction.createdAt || new Date()).toLocaleString();

    return (
        <div className="font-mono text-sm leading-tight p-2 w-[80mm] max-w-full mx-auto" style={{ color: '#000', background: '#fff' }}>
            <div className="text-center mb-4">
                <h1 className="text-2xl font-black mb-1 uppercase tracking-widest">Galactic</h1>
                <h2 className="text-lg font-bold mb-1">Point of Sale</h2>
                <p className="text-xs">123 Starburst Ave, Sector 7G</p>
                <p className="text-xs">Tel: 800-555-0199</p>
            </div>
            <div className="border-t border-b border-black py-2 mb-4 text-xs">
                <div className="flex justify-between"><span>Date:</span><span>{date}</span></div>
                <div className="flex justify-between mt-1"><span>Txn:</span><span>#{transaction._id?.substring(0, 8).toUpperCase() || '1234F'}</span></div>
                <div className="flex justify-between mt-1"><span>Cashier:</span><span>{transaction.cashierName || 'Admin'}</span></div>
            </div>
            <div className="mb-4">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="text-left font-bold py-1 w-1/2">Item</th>
                            <th className="text-center font-bold py-1 w-1/6">Qty</th>
                            <th className="text-right font-bold py-1 w-1/3">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(transaction.receiptItems || transaction.items).map((item, idx) => {
                            const productName = item.product?.name || item.name;
                            const quantity = item.quantity;
                            const price = item.currentPrice !== undefined ? item.currentPrice : item.price;
                            return (
                                <tr key={idx} className="align-top border-b border-dashed border-gray-300">
                                    <td className="py-2 pr-1">{productName}</td>
                                    <td className="py-2 text-center">{quantity}</td>
                                    <td className="py-2 text-right">${(price * quantity).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-black pt-2 mb-4 text-sm font-bold">
                <div className="flex justify-between items-end mb-1"><span>Total:</span><span className="text-xl leading-none">${transaction.total.toFixed(2)}</span></div>
                <div className="flex justify-between mt-2 font-normal text-xs"><span>Cash Tendered:</span><span>${transaction.payment.toFixed(2)}</span></div>
                <div className="flex justify-between mt-1 font-normal text-xs"><span>Change Due:</span><span>${transaction.change.toFixed(2)}</span></div>
            </div>
            <div className="border-t border-black pt-4 text-center mt-6 flex flex-col items-center">
                <p className="font-bold mb-1">THANK YOU FOR SHOPPING!</p>
                <p className="text-[10px] text-center max-w-[90%]">Returns accepted within 14 days with receipt.</p>
                <p className="text-[10px] text-center max-w-[90%] mt-2">www.galacticpos.com</p>
            </div>
        </div>
    );
};

export default Receipt;
