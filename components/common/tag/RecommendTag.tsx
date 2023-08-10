import classNames from "classnames/bind";
import style from 'components/common/tag/Recommendtag.module.scss';

type Props = {
  tagName: string;
}

const cn = classNames.bind(style);

function RecommendTag({ tagName }: Props) {
  return (
    <div>
      {tagName}
    </div>
  )
}

export default RecommendTag