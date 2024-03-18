import { Component } from "react";

interface IProps {
  features: {
    number: number,
    shape: number,
    color: number,
    fill: number,
    background: number,
    border: number,
  },
  position: number
}

interface IState {
  features: IProps["features"],
  position: IProps["position"],
  selected: boolean,
}

export default class Card extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      features: { ...props.features },
      position: props.position,
      selected: false,
    };
  }

  onSelect() {
    console.log("position", !this.state.selected);
    this.setState({ selected: !this.state.selected });
  }

  render() {
    return (
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            {Object.values(this.state.features).join(", ")}
          </h2>
        </a>
      </div>
    )
  }
}
