import React from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Zoom,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  Checkbox,
  MenuItem,
  RadioGroup,
  Radio,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  GridList,
  GridListTile,
  GridListTileBar
} from '@material-ui/core'

import TextInputMask from 'react-masked-text'

import IconTextInput from '../main/IconTextInput'
import InputMoney from '../inputs/InputMoney'

import { dateToString, getDateFromStringEg, toReal, toDateFormat } from '../../helpers'
import { creditCardService, paymentService } from '../../services/index'

const styles = {
  maskInput: {
    color: '#666',
    backgroundColor: 'white',
    border: 'solid 0',
    borderBottom: 'solid 1px #666',
    margin: '10px',
    width: '100px',
    marginRight: '20px'
  }
}

export default class EditPaymentModal extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      payment: {},
      description: '',
      cards: this.props.cards,
      paymentType: 2,
      useCreditCard: false,
      fixedPayment: false,
      qtdInstallments: 10,
      card: [],
      costByInstallment: true,
      costText: '',
      installments: [],
      firstPayment: '',
      loading: false,
      paidInstallments: []
    }
  }

  componentDidMount() {
    const {
      description,
      installments,
      fixedPayment,
      type,
      creditCardId,
      invoice
    } = this.props.payment || {}

    const firstInstallment = (installments || [])[0] || {}
    const qtdInstallments = (installments || []).length || 1
    const costs = (installments || []).map(p => p.cost)
    const paidInstallments = (installments || []).filter(p => p.paid).map(p => p.number)

    this.setState({
      useCreditCard: creditCardId > 0,
      description: description || '',
      paymentType: type || 2,
      card: creditCardId,
      useCreditCard: creditCardId ? true : false,
      showModal: true,
      paidInstallments,
      invoice
    })
    this.updateInstallments({
      costByInstallment: false,
      qtdInstallments,
      costText: toReal(costs.length ? costs.reduce((a, b) => a + b) : 0),
      fixedPayment,
      paidInstallments,
      firstPayment: dateToString(firstInstallment.date ? new Date(firstInstallment.date) : null),
    })
  }

  updateInstallments(data) {
    const { payment, paidInstallments, costByInstallment, qtdInstallments, costText, fixedPayment, firstPayment } = data
    const installments = []
    let cost = Number((costText || '').replace(/[^0-9,]/g, '').replace(',', '.') || 0)
    if (cost > 0 && qtdInstallments > 0 && /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/.test(firstPayment)) {
      let day = Number(firstPayment.substr(0, 2))
      let month = Number(firstPayment.substr(3, 2))
      let year = Number(firstPayment.substr(6, 4))

      if (!fixedPayment) {
        let firstCost = cost
        if (!costByInstallment) {
          const total = cost
          cost = parseFloat(Number(cost / qtdInstallments).toFixed(2))
          const sum = parseFloat(Number(cost * qtdInstallments).toFixed(2))
          firstCost = cost + (total > sum ? total - sum : sum - total)
        }

        for (let i = 1; i <= qtdInstallments; i++) {
          if (month > 12) {
            month = 1
            year++
          }
          installments.push({
            number: i,
            cost: cost,
            date: new Date(`${month}/${day}/${year}`),
            paid: paidInstallments.indexOf(i) !== -1
          })
          month++
        }
        installments[0].cost = firstCost
      }
      else
        installments.push({ number: 1, cost: cost, date: new Date(`${month}/${day}/${year}`) })
    }

    this.setState({
      costByInstallment,
      qtdInstallments,
      costText,
      firstPayment,
      installments,
      fixedPayment,
      errorMessage: ''
    })
  }

  paidChanged(installment, paid) {
    installment.paid = paid
    this.setState({ installments: this.state.installments })
  }

  save() {
    const { invoice, installments, fixedPayment, description, firstPayment, paymentType, card, useCreditCard } = this.state

    const payment = {}
    payment.id = this.props.payment.id
    payment.description = description
    payment.type = paymentType
    payment.installments = installments
    payment.fixedPayment = fixedPayment
    payment.invoice = invoice

    if (!description || !installments.length) {
      this.setState({ errorMessage: 'Preencha corretamente os campos.' })
      return
    }

    if (useCreditCard)
      payment.creditCardId = card

    this.setState({ loading: true })

    if (payment.id)
      paymentService.update(payment)
        .then(() => this.props.onFinish())
        .catch(err => this.setState({ loading: false, errorMessage: err.error }))
    else
      paymentService.create(payment)
        .then(() => this.props.onFinish())
        .catch(err => this.setState({ loading: false, errorMessage: err.message }))
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={() => this.props.onClose()}
        transitionDuration={300}
        TransitionComponent={Zoom}
        maxWidth="lg"
        fullWidth>
        <DialogTitle style={{ textAlign: 'center' }}>
          {this.props.payment.id > 0 ? 'Editar Pagamento' : 'Novo Pagamento'}
        </DialogTitle>
        <DialogContent>
          <div style={{ textAlign: 'start', color: '#666', fontFamily: '"Roboto", "Helvetica", "Arial", "sans-serif"' }} >

            <GridList cellHeight={300} cols={5}>
              <GridListTile cols={3}>

                <IconTextInput
                  label="Descrição"
                  value={this.state.description}
                  onChange={e => this.setState({ description: e.value, errorMessage: '' })}
                />
                <FormControl style={{ width: '200px', marginLeft: '20px', marginTop: '10px' }}>
                  <InputLabel htmlFor="select-tipo">Tipo</InputLabel>
                  <Select
                    value={this.state.paymentType || 2}
                    color="red"
                    onChange={e => this.setState({ paymentType: e.target.value })}>
                    <MenuItem key={1} value={1}><span style={{ color: 'green', fontWeight: 'bold' }}>RENDA</span></MenuItem>
                    <MenuItem key={2} value={2}><span style={{ color: 'red', fontWeight: 'bold' }}>DESPESA</span></MenuItem>
                  </Select>
                </FormControl>

                <div style={{ marginRight: '10px', marginTop: '10px', color: '#666' }}>
                  <span>Valor:</span>
                  <TextInputMask
                    onChangeText={e => this.updateInstallments({ ...this.state, costText: e })}
                    kind="money"
                    value={this.state.costText}
                    style={styles.maskInput} />
                  <span>Data:</span>
                  <TextInputMask
                    onChangeText={e => this.updateInstallments({ ...this.state, firstPayment: e })}
                    kind="datetime"
                    value={this.state.firstPayment}
                    options={{ format: 'dd/MM/YYYY' }}
                    style={styles.maskInput} />
                  <FormControlLabel label="Pagamento Fixo ?"
                    control={<Checkbox
                      checked={this.state.fixedPayment}
                      onChange={(e, c) => this.updateInstallments({ ...this.state, fixedPayment: c })}
                      color="primary"
                    />} />
                </div>

                <div hidden={!this.state.cards.length}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={this.state.useCreditCard}
                        onChange={(e, c) => this.setState({ useCreditCard: c, card: this.state.cards[0].id })}
                        color="primary"
                      />
                    }
                    label="Cartão de crédito"
                  />
                  {
                    this.state.cards.length && this.state.useCreditCard ?
                      <span>
                        <FormControl style={{ marginLeft: '20px', marginRight: '20px' }}>
                          <InputLabel htmlFor="select-tipo">Cartão de crédito</InputLabel>
                          <Select style={{ width: '160px' }} value={this.state.card}
                            onChange={e => this.setState({ card: e.target.value })}>
                            {this.state.cards.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <FormControlLabel label="Fatura"
                          control={<Checkbox
                            defaultChecked={this.state.invoice}
                            onChange={(e, c) => this.setState({ invoice: c })}
                            color="primary"
                          />} />
                      </span>
                      : null
                  }
                </div>

                <div hidden={this.state.fixedPayment} style={{ color: '#666' }}>
                  <FormControlLabel label="Valor por parcela"
                    control={<Checkbox
                      defaultChecked={this.state.costByInstallment}
                      onChange={(e, c) => this.updateInstallments({ ...this.state, costByInstallment: c })}
                      color="primary"
                    />} />
                  <span>Qtd. Parcelas:</span>
                  <TextInputMask
                    onChangeText={e => this.updateInstallments({ ...this.state, qtdInstallments: e })}
                    kind="only-numbers"
                    value={this.state.qtdInstallments}
                    style={styles.maskInput} />
                </div>

                <div style={{ textAlign: 'center', color: '#d55', marginTop: '20px' }}>
                  <span>{this.state.errorMessage}</span>
                </div>

              </GridListTile>
              <GridListTile cols={2}>

                <div hidden={!this.state.installments.length || this.state.fixedPayment}
                  style={{ textAlign: 'center', marginTop: '20px' }}>
                  <fieldset style={{ borderColor: '#ddd' }}>
                    <legend style={{ fontSize: '16px' }}>PARCELAS</legend>
                    <List component="nav" style={{ height: '240px', overflowY: 'scroll' }}>
                      <ListItem style={{ padding: '0px', color: '#666', borderBottom: '1px solid #666' }}>
                        <ListItemText style={{ fontSize: '10px' }} primary="N°"></ListItemText>
                        <ListItemText primary="VALOR"></ListItemText>
                        <ListItemText primary="DATA"></ListItemText>
                        <ListItemText primary="PAGA?"></ListItemText>
                      </ListItem>
                      {this.state.installments.map((p, i) =>
                        <ListItem style={{ padding: '0px', color: '#666', borderBottom: '1px solid #666' }} key={i}>
                          <ListItemText primary={p.number}></ListItemText>
                          <ListItemText primary={toReal(p.cost)}></ListItemText>
                          <ListItemText primary={toDateFormat(p.date, 'dd/MM/yyyy')}></ListItemText>
                          <Checkbox
                            checked={p.paid}
                            onChange={(e, c) => this.paidChanged(p, c)}
                            color="primary"
                          />
                        </ListItem>
                      )}
                    </List>
                  </fieldset>
                </div>
              </GridListTile>
            </GridList>
          </div>
        </DialogContent>
        <DialogActions>
          <div hidden={!this.state.loading}>
            <CircularProgress size={30} />
          </div>
          <Button onClick={() => this.props.onClose()} variant="raised" autoFocus>cancelar</Button>
          <Button disabled={this.state.loading} onClick={() => this.save()} color="primary" variant="raised" autoFocus>salvar</Button>
        </DialogActions>
      </Dialog>
    )
  }
}