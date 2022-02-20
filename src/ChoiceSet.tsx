import { Component } from 'react';
import { capitalize } from './App';
import { Berries, Berry } from './CLData/Berries';
import { ItemCategory, ItemSlot, Wardrobe, WardrobeRules } from './CLData/Clothes/Wardrobe';
import { CharacterAppearance, differentAppearance } from './CLStyleLib/CharacterAppearance';
import { differentItemColors, Item } from './CLStyleLib/Item';
import { Icon } from './ReactComponents/Icon';

interface ItemChoiceProps {
    slot: ItemSlot,
    item: Item,
    appearance: CharacterAppearance,
    setAppearance: (newAppearance: CharacterAppearance) => void;
}
class ItemChoice extends Component<ItemChoiceProps> {
    override render() {
        const proposedAppearance = this.props.appearance.withEquipped(this.props.slot, this.props.item);

        // TODO: Disable hats for non-Dwarves
        let className = '';
        if (this.props.appearance.wornItems[this.props.slot]?.name === this.props.item.name) {
            className = "active";
        }

        return (
            <li>
                <button className={className} onClick={() => this.props.setAppearance(proposedAppearance)}>
                    <Icon appearance={proposedAppearance} />
                    <span>{this.props.item.name}</span>
                </button>
            </li>
        );
    }
}

interface NoneChoiceProps {
    slot: ItemSlot
    appearance: CharacterAppearance,
    setAppearance: (newAppearance: CharacterAppearance) => void;
}
class NoneChoice extends Component<NoneChoiceProps> {
    override shouldComponentUpdate(newProps: ChoiceSetProps): boolean {
        return differentAppearance(this.props.appearance, newProps.appearance);
    }

    override render() {
        const proposedAppearance = this.props.appearance.withEquipped(this.props.slot);

        let className = this.props.appearance.wornItems[this.props.slot] === undefined ? 'active' : '';

        return (
            <li>
                <button className={className} onClick={() => this.props.setAppearance(proposedAppearance)}>
                    <Icon appearance={proposedAppearance} />
                    <span>None</span>
                </button>
            </li>
        );
    }
}

interface BerryRowProps {
    slot: ItemSlot,
    berry: Berry,
    appearance: CharacterAppearance,
    setAppearance: (newAppearance: CharacterAppearance) => void;
}
class BerryRow extends Component<BerryRowProps> {
    override render() {
        const { appearance, setAppearance } = this.props;
        const equipped = appearance.wornItems[this.props.slot];

        let bleachAppearance = appearance;
        let canBleach = false;
        let dyeAppearance = appearance;
        let canDye = false;

        if (equipped !== undefined) {
            bleachAppearance = appearance.withColorManipulated(this.props.slot, this.props.berry.bleach)
            canBleach = differentItemColors(
                bleachAppearance.wornItems[this.props.slot]!.colors,
                equipped.colors
            );

            dyeAppearance = appearance.withColorManipulated(this.props.slot, this.props.berry.dye)
            canDye = differentItemColors(
                dyeAppearance.wornItems[this.props.slot]!.colors,
                equipped.colors
            );
        }

        return (
            <div className="berry">
                <button disabled={!canBleach} onClick={() => setAppearance(bleachAppearance)}>
                    <Icon appearance={bleachAppearance} />
                    <span>{capitalize(this.props.berry.name)} Bleach</span>
                </button>
                <button disabled={!canDye} onClick={() => setAppearance(dyeAppearance)}>
                    <Icon appearance={dyeAppearance} />
                    <span>{capitalize(this.props.berry.name)} Dye</span>
                </button>
            </div>
        );
    }
}

interface BerryGridProps {
    slot: ItemSlot
    appearance: CharacterAppearance,
    setAppearance: (newAppearance: CharacterAppearance) => void;

}
class BerryGrid extends Component<BerryGridProps> {
    override render() {
        return (
            <div className="berryGrid">
                {Berries.map(berry => <BerryRow key={berry.name} {...this.props} berry={berry}></BerryRow>)}
            </div>
        );
    }
}

interface ChoiceSetSummaryProps {
    slot: ItemSlot
    appearance: CharacterAppearance,
    setAppearance: (newAppearance: CharacterAppearance) => void;

}
export class ChoiceSetSummary extends Component<ChoiceSetSummaryProps> {
    override render() {
        let equipped = this.props.appearance.wornItems[this.props.slot];

        if (equipped) {
            let recipe = this.props.appearance.wornItems[this.props.slot]!.toRecipeString()
            return (
                <summary>
                    {WardrobeRules[this.props.slot].label}
                    <span className="currentSelection"> — {equipped.name} {recipe}</span>
                </summary>
            );
        } else {
            return (<summary>{WardrobeRules[this.props.slot].label}</summary>);
        }
    }
}

interface ChoiceSetProps {
    slot: ItemSlot
    appearance: CharacterAppearance,
    setAppearance: (newAppearance: CharacterAppearance) => void;

}
export class ChoiceSet extends Component<ChoiceSetProps> {
    override shouldComponentUpdate(newProps: ChoiceSetProps): boolean {
        return differentAppearance(this.props.appearance, newProps.appearance);
    }

    override render() {
        return (
            <details open={WardrobeRules[this.props.slot].initiallyVisible} className={'slotOptions' + WardrobeRules[this.props.slot].colorable ? ' colorable' : ''}>
                <ChoiceSetSummary {...this.props}></ChoiceSetSummary>
                <ul className="optionsList">
                    {!WardrobeRules[this.props.slot].required ? <NoneChoice {...this.props}></NoneChoice> : <></>}
                    {Wardrobe[this.props.slot].flatMap(item => {
                        return item instanceof Item ? [
                            <ItemChoice key={item.name} {...this.props} item={item}></ItemChoice>
                        ] : [
                            <li key={item.category} className="category"><h4>{item.category}</h4></li>,
                            ...item.items.map(subItem => (
                                <ItemChoice key={(item as ItemCategory).category! + '_' + subItem.name} {...this.props} item={subItem}></ItemChoice>
                            ))
                        ];
                    })}
                </ul>
                {WardrobeRules[this.props.slot].colorable ? <BerryGrid {...this.props}></BerryGrid> : <></>}
            </details>
        );
    }
}
