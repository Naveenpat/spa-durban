import { inventoryService } from "../service.index";

export const updateInventoriesAfterSell = async (inventoryData: any[]) => {
  // Fetch all outlets by their Ids
  const allInventoryUpdated = await Promise.all(
    inventoryData.map(
      async (inventory: { inventoryId: string; quantityUsed: number }) => {
        const updated = await inventoryService.updateInventoryById(
          inventory.inventoryId,
          {
            $inc: { saleQuantity: inventory.quantityUsed },
          }
        );
        return updated;
      }
    )
  );
  return allInventoryUpdated;
};

export const checkQuantitiesMatch = (
  totalProductQuantity: any,
  inventoryData: any
) => {
  for (let product of totalProductQuantity) {
    // Find the corresponding inventory item
    let inventoryItem: any = inventoryData.find(
      (item: any) => item.productId.toString() === product.productId.toString()
    );

    // If no matching inventory item is found or the quantities do not match, return false
    if (!inventoryItem || inventoryItem.quantity !== product.quantity) {
      return false;
    }
  }
  // If all quantities match, return true
  return true;
};

export const groupAndSumQuantities = (data: any) => {
  const groupedData = data.reduce((acc: any, curr: any) => {
    const existingItem = acc.find(
      (item: any) => item.productId === curr.productId
    );

    if (existingItem) {
      existingItem.quantity += curr.quantity;
    } else {
      acc.push({ ...curr });
    }

    return acc;
  }, []);

  return groupedData;
};
