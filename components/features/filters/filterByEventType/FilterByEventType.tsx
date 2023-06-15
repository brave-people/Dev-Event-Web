import DefaultDropdown from "components/common/dropdown/DefaultDropdown";

function FilterByEventType() {
  const eventType = ["전체", "스터디", "대회", "교육", "모임", "웨비나", "컨퍼런스", "해커톤", "공모전", "이벤트", "포럼"]
  return (
    <div>
      <DefaultDropdown
        title="행사 유형"
        options={eventType}
      />
    </div>
  )
}

export default FilterByEventType;