import React from 'react'
import BebitLogo from '../../assets/svg/Bebit.svg'
import './herobetbit.scss'

const HeroBetbit = () => {
    return (
        <div className="voltage-button">
            <figure className="bitbit-logo w-120p h-120 object-contain">
                <img src={BebitLogo} />
            </figure>
            <div className="dots">

            </div>
        </div>
    )
}

export default HeroBetbit