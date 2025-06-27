import React, { useState, MouseEvent } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { IconDotsVertical, IconPin, IconPinFilled } from '@tabler/icons-react';

interface Product {
    _id: string;
    itemName: string;
    itemUrl?: string;
    sellingPrice: number;
    colorCode?: string;
    pinned?: boolean;
}

interface ProductCardProps {
    product: Product;
    onItemClick: (product: Product) => void;
    handleAction: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onItemClick, handleAction }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuClick = (event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation(); // prevent card click
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const handlePinToggle = (event: MouseEvent<HTMLLIElement>) => {
        event.stopPropagation(); // prevent card click
        handleAction(product);
        handleClose();
    };

    return (
        <div
            key={product._id}
            className="w-[230px] h-[260px] rounded-lg overflow-hidden border hover:shadow-md transition cursor-pointer relative bg-white"
            onClick={() => onItemClick(product)}
            style={{
                borderColor: product.pinned ? '#006972' : (product.colorCode || '#ccc'),
                borderWidth: '2px',
                borderStyle: 'solid',
            }}

        >
            {/* Image */}
            <div className="w-full h-[150px] bg-gray-100 relative">
                <img
                    src={
                        product.itemUrl
                            ? `${process.env.REACT_APP_BASE_URL}/${product.itemUrl}`
                            : '/no-image.jpg'
                    }
                    alt={product.itemName}
                    className="w-full h-full object-cover"
                />

                {/* 3-dot Menu */}
                <div
                    className="absolute top-2 right-2 p-[6px] bg-white border border-gray-300 rounded-full z-10"
                    onClick={handleMenuClick}
                >
                    <IconDotsVertical size={16} color="#006972" />
                </div>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem
                        onClick={handlePinToggle}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1, // spacing between icon and text
                            fontSize: '0.875rem', // small text (14px)
                            paddingY: 1,
                            paddingX: 2,    
                        }}
                    >
                        {product.pinned ? (
                            <>
                                <IconPinFilled size={16} />
                                <span style={{ fontSize: '0.875rem' }}>Unpin</span>
                            </>
                        ) : (
                            <>
                                <IconPin size={16} />
                                <span style={{ fontSize: '0.875rem' }}>Pin</span>
                            </>
                        )}
                    </MenuItem>

                </Menu>
            </div>

            {/* Item Name */}
            <div className="p-2 text-[14px] font-medium text-gray-800 line-clamp-2 min-h-[75px]">
                {product.itemName}
            </div>

            {/* Price Row */}
            <div className="px-2 pb-3 text-sm font-semibold text-primary">
                R {product.sellingPrice}
            </div>
        </div>
    );
};

export default ProductCard;
