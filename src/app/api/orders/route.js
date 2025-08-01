import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const orderData = await request.json();
    
    const {
      customer,
      delivery,
      items,
      totalPrice,
      payment,
      comment
    } = orderData;

    const order = {
      id: Date.now().toString(),
      status: 'new',
      createdAt: new Date().toISOString(),
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        inn: customer.inn,
        phone: customer.phone,
        email: customer.email,
        isLegalEntity: customer.isLegalEntity
      },
      delivery: {
        type: delivery.delivery,
        city: delivery.city,
        address: delivery.address,
        apartment: delivery.apartment,
        pickupAddress: delivery.pickupAddress,
        coordinates: delivery.coordinates,
        fullAddress: delivery.fullAddress
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        material: item.material,
        dimensions: item.dimensions
      })),
      payment: {
        method: payment.payment,
        total: totalPrice
      },
      comment: comment
    };

    console.log('Новый заказ:', order);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Заказ успешно создан'
    });

  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при создании заказа' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const mockOrders = [
      {
        id: '1',
        status: 'new',
        customer: {
          firstName: 'Иван',
          lastName: 'Иванов',
          phone: '+7 (999) 123-45-67',
          email: 'ivanov@example.com'
        },
        delivery: {
          type: 'pickup',
          city: 'Краснодарский край, г. Сочи',
          pickupAddress: 'ул. Кипарисовая, 56'
        },
        items: [
          {
            id: '1',
            name: 'Диван-кровать Скаген',
            price: 25000,
            quantity: 1
          }
        ],
        payment: {
          method: 'card',
          total: 25000
        },
        createdAt: '2024-01-15T10:30:00Z'
      }
    ];

    return NextResponse.json(mockOrders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении заказов' },
      { status: 500 }
    );
  }
} 