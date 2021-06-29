import React from 'react'
import { Checkbox, FormControlLabel } from '@material-ui/core'

import { InputDate, InputMoney } from '../../../../components/inputs'

export function CostDateFixedBox({ cost, costChanged, date, dateChanged, fixedPayment, fixedPaymentChanged }) {
    return (
        <div style={{ marginRight: '10px', marginTop: '10px', color: '#666' }}>
            <span>Valor:</span>
            <InputMoney
                onChangeText={e => costChanged(e)}
                kind="money"
                value={cost} />
            <span>Data:</span>
            <InputDate
                onChangeText={e => dateChanged(e)}
                kind="datetime"
                value={date}
                options={{ format: 'dd/MM/YYYY' }} />
            <FormControlLabel label="Pagamento Fixo ?"
                control={<Checkbox
                    checked={fixedPayment}
                    onChange={(e, c) => fixedPaymentChanged(c)}
                    color="primary"
                />} />
        </div>
    )
}