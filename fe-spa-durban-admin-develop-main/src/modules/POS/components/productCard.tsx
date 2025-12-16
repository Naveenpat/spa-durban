import React, { useState, MouseEvent } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { IconDotsVertical, IconPencil, IconPin, IconPinFilled } from '@tabler/icons-react';
import { isAuthorized } from 'src/utils/authorization';

interface Product {
    _id: string;
    itemName: string;
    itemUrl?: string;
    sellingPrice: number;
    colorCode?: string;
    pinned?: boolean;
}

interface SelectedService {
  _id: string;
  itemName: string;
  sellingPrice: number;
}

interface ProductCardProps {
    product: Product;
    categoryImageUrl: string;
    handleEditService: (service: SelectedService) => void;
    setEditServiceModal: (open: boolean) => void;
    onItemClick: (product: Product) => void;
    handleAction: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, categoryImageUrl, onItemClick, handleAction,setEditServiceModal,handleEditService }) => {

    // console.log('------product', product)
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

    const handleEditServiceModalOpen = () => {
        // event.stopPropagation();
         handleClose();
        setEditServiceModal(true);
        handleEditService(product)
    }

    return (
        <div
            key={product._id}
            className="w-[170px] h-[219px] rounded-lg overflow-hidden border hover:shadow-md transition cursor-pointer relative bg-white"
            onClick={() => {
                const price = product?.sellingPrice ?? 0;
                if (price > 0) {
                    onItemClick(product);
                }
            }}
            style={{
                borderColor: product.pinned ? '#006972' : (product.colorCode || '#ccc'),
                borderWidth: '2px',
                borderStyle: 'solid',
            }}

        >
            {/* Image */}
            <div className="w-full h-[110px] bg-gray-100 relative">
                {/* <img
                    src={
                        product.itemUrl 
                            ? `${process.env.REACT_APP_BASE_URL}/${product.itemUrl}`
                            : `${process.env.REACT_APP_BASE_URL}/${categoryImageUrl}` || '/no-image.jpg'
                    }
                    alt={product.itemName}
                    className="w-full h-full object-cover"
                /> */}
                <img
                    src={
                        product?.itemUrl
                            ? `${process.env.REACT_APP_BASE_URL}/${product.itemUrl}`
                            : categoryImageUrl
                                ? `${process.env.REACT_APP_BASE_URL}/${categoryImageUrl}`
                                : '/no-image.jpg'
                    }
                    alt={product?.itemName || "No Image"}
                    className="w-full h-full object-cover"
                />

                {/* 3-dot Menu */}
                <div
                    className="absolute top-1 right-1 p-[6px] z-10"
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
                    {isAuthorized("EDIT_SERVICE_ON_POS") && ( <MenuItem onClick={handleEditServiceModalOpen} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1, // spacing between icon and text
                        fontSize: '0.875rem', // small text (14px)
                        paddingY: 1,
                        paddingX: 2,
                    }}> <>
                            <IconPencil size={16} />
                            <span style={{ fontSize: '0.875rem' }}>Edit</span>
                        </></MenuItem>)}
                   
                </Menu>
            </div>

            {/* Item Name */}
            {/* <div className="p-2 text-[14px] font-medium text-gray-800 line-clamp-2 min-h-[59px]">
                {product.itemName}
            </div> */}
            <div className="p-2 text-[14px] font-medium text-gray-800 min-h-[59px]">
                {product.itemName
                    ? product.itemName
                        .split(" ")                                   // words में तोड़ो
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // हर word का first letter uppercase
                        .join(" ")                                    // वापस string बनाओ
                        .slice(0, 40) + (product.itemName.length > 40 ? "..." : "") // 40 char limit + ...
                    : ""}

            </div>


            {/* Price Row */}
            <div className="absolute bottom-0 left-0 w-full px-2 pb-1 text-sm font-semibold text-primary">
                R {product.sellingPrice}
            </div>
        </div>
    );
};

export default ProductCard;
