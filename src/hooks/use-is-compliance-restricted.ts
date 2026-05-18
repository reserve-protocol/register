import useComplianceRestrictions from './use-compliance-restrictions'

const useIsComplianceRestricted = () => {
  const { data, isLoading } = useComplianceRestrictions()

  console.log('data', data)

  return isLoading || data?.restricted === true
}

export default useIsComplianceRestricted
