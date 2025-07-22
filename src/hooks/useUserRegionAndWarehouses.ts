import { useAppSelector } from "@/app/hooks"

export const useUserRegionAndWarehouses = () => {
  const user = useAppSelector((state) => state.auth.user.user)
  
  const region = user?.storedetails?.region
  const warehouses = user?.storedetails?.warehouses ?? []

  return {
    region,
    regionId: region?.id,
    regionName: region?.name,
    warehouses,
  }
}