import DefaultDropdown from "components/common/dropdown/DefaultDropdown";

function FilterByCoast() {
  const coast = ["전체", "유료", "무료"];
  return (
    <div>
      <DefaultDropdown
        title="비용"
        options={coast}
      />
    </div>  
  )
}

export default FilterByCoast;