import useComplianceRestrictions from './use-compliance-restrictions'

const useIsComplianceRestricted = () => {
  const { data, isLoading } = useComplianceRestrictions()

  return isLoading || data?.restricted === true
}

export default useIsComplianceRestricted
