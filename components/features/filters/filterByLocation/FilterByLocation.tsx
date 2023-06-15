import DefaultDropdown from "components/common/dropdown/DefaultDropdown";

function FilterByLocation() {
  const location = ["전체", "오프라인", "온라인"]
  return (
    <div>
      <DefaultDropdown
        title="참여 방법"
        options={location}
      />
    </div>  
  )
}

export default FilterByLocation;